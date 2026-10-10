import { test, expect } from '@playwright/test';

const LOOPS = ['osteria-lume', 'juniper-vale', 'basecamp', 'lanternway', 'lab'];

test('each home loop and poster is served and small', async ({ request }) => {
  for (const slug of LOOPS) {
    const mp4 = await request.get(`/assets/home/loops/${slug}.mp4`);
    expect(mp4.status(), `${slug}.mp4`).toBe(200);
    expect(mp4.headers()['content-type']).toContain('video/mp4');
    expect((await mp4.body()).length, `${slug}.mp4 size`).toBeLessThan(900 * 1024);
    const poster = await request.get(`/assets/home/loops/${slug}.webp`);
    expect(poster.status(), `${slug}.webp`).toBe(200);
    expect((await poster.body()).length, `${slug}.webp size`).toBeLessThan(60 * 1024);
  }
});
