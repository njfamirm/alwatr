import prompts from 'prompts';

import 'zx/globals';

import {optimizer} from '../lib/optimizer.js';

export const reg = new RegExp('^(.*)(-)([0-9]{2,4})(x)([0-9]{2,4})(.(jpg|jpeg|png))$');

export async function pageOptimizer(): Promise<void> {
  let allImages: string[] = [];

  const directory = await prompts({
    type: 'text',
    name: 'directory',
    message: 'Enter Directory',
    validate: async (directory: string): Promise<string | boolean> => {
      try {
        allImages = (
          await globby(directory, {
            expandDirectories: {
              extensions: ['jpg', 'jpeg', 'png'],
            },
          })
        ).map((i) => path.resolve(i));

        if (allImages.length === 0) {
          return 'This directory is empty';
        }

        return true;
      }
      catch (error) {
        return (error as Error).message;
      }
    },
  }).then((promptsResult) => promptsResult.directory);

  const images = await prompts({
    type: 'multiselect',
    name: 'images',
    message: 'Select the items that need to be optimized in ' + directory,
    choices: allImages.map((image) => {
      const imageFileName = image.split('/').reverse()[0];

      return {
        title: imageFileName,
        selected: !reg.test(imageFileName),
        value: image,
      };
    }),
  }).then((promptsResult) => promptsResult.images as string[]);

  if (images.length > 0) {
    const confirm = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure',
    }).then((promptsResult) => promptsResult.confirm);

    if (confirm) {
      for await (const [index, image] of images.entries()) {
        try {
          await optimizer(image, path.resolve('pros', image), 1080);

          console.log(chalk.bold(`[ ${index + 1} | ${images.length} ]`), chalk.green('✔'), image);
        }
        catch (error) {
          console.log(chalk.bold(`[ ${index + 1} | ${images.length} ]`), chalk.red('✗'), (error as Error).message);
        }
      }
    }
  }

  await prompts({
    type: 'confirm',
    name: 'continue',
    message: 'Are you sure to continue',
  });
}
