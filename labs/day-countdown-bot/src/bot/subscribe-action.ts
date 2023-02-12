import {sendDayCountDown} from '../dayCountdown.js';
import {message} from '../director/l18e-loader.js';
import {userComposer} from '../lib/bot.js';
import {chatStorageEngine} from '../lib/storage.js';
import {isSubscribed} from '../user.js';

userComposer.action('subscribe', async (ctx) => {
  if (isSubscribed(ctx.chatId as number | string)) {
    await ctx.sendMessageToChat(message('action_subscribe_added_before'));
  }
  else {
    chatStorageEngine.set({id: (ctx.chatId as number | string).toString()});
    const response = await ctx.sendMessageToChat(message('action_subscribe_success'));
    if (response == null) return; // cannot send message!
  }

  await sendDayCountDown(ctx.chatId as number | string);
  await ctx.answerCbQuery();
});
