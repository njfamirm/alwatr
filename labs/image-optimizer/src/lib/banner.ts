import 'zx/globals';

export async function banner(): Promise<void> {
  await $`clear`;

  const banner = await fs.readFile('./assets/banner.txt').then((x) => x.toString());

  console.log(banner);
}
