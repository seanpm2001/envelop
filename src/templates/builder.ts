import fs from 'fs';
import Handlebars, { compile } from 'handlebars';
import juice from 'juice';
import sass from 'sass';
import templates from './';

Handlebars.registerPartial(
  'layout',
  fs.readFileSync('./src/templates/partials/layout.hbs', 'utf-8')
);
Handlebars.registerPartial(
  'proposalsHtml',
  fs.readFileSync('./src/templates/partials/proposals-html.hbs', 'utf-8')
);
Handlebars.registerPartial(
  'proposalsText',
  fs.readFileSync('./src/templates/partials/proposals-text.hbs', 'utf-8')
);

export default function buildMessage(id: string, params: any) {
  const template = templates[id];
  const headers = {};

  const extraParams: { host: string; subject: string; unsubscribeLink?: string } = {
    host: process.env.HOST as string,
    subject: template.subject
  };

  if (id !== 'subscribe') {
    extraParams.unsubscribeLink = `${process.env.FRONT_HOST}/unsubscribe?${new URLSearchParams({
      signature: params.signature,
      email: params.to,
      address: params.address
    }).toString()}`;

    headers['List-Unsubscribe'] = `<${extraParams.unsubscribeLink}>`;
  }

  return {
    to: params.to,
    from: compile(template.from)(params),
    subject: compile(template.subject)(params),
    text: compile(template.text)({
      ...params,
      ...extraParams
    }),
    html: juice(
      compile(template.html)({
        ...params,
        ...extraParams
      }),
      {
        extraCss: sass.compile('./src/templates/styles/styles.scss').css
      }
    ),
    headers
  };
}
