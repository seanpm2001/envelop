import { send } from '../../helpers/mail';
import templates from '../../templates';
import type { Job } from 'bull';
import type { Message } from '../../../types';

export default async (job: Job): Promise<any> => {
  const { email, id } = job.data;
  const msg = await templates.newProposal.prepare({
    to: email,
    id
  });

  return await send(msg as Message);
};
