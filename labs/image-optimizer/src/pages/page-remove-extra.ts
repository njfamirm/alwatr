import prompts from 'prompts';

import 'zx/globals';

export const reg = new RegExp('^(.*)(-)([0-9]{2,4})(x)([0-9]{2,4})(.(jpg|jpeg|png))$');

export async function pageRemoveExtra(): Promise<void> {
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
    message: 'Select extra images in ' + directory,
    choices: allImages.map((image) => {
      const imageFileName = image.split('/').reverse()[0];

      return {
        title: imageFileName,
        selected: reg.test(imageFileName),
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
      for await (const image of images) {
        await fs.remove(image);

        console.log(chalk.red('✗'), image);
      }
    }
  }

  await prompts({
    type: 'confirm',
    name: 'continue',
    message: 'Are you sure to continue',
  });
}
