import prompts from 'prompts';

import 'zx/globals';

export async function pageHome(): Promise<number> {
  return await prompts({
    type: 'select',
    name: 'choice',
    message: 'Enter Choice',
    choices: [
      {
        title: '[1] Optimize All image',
        value: 1,
      },
      {
        title: '[2] Remove Extra image',
        value: 2,
      },
      {
        title: '[3] Exit',
        value: 3,
      },
    ],
  }).then((promptsResult) => promptsResult.choice);
}
