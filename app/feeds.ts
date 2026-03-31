import type { FeedGroup } from '../app/types/feed'
// 友链检测 CLI 需要使用显式导入和相对路径
import { myFeed } from '../blog.config'
// eslint-disable-next-line unused-imports/no-unused-imports
import { getFavicon, getGithubAvatar, getGithubIcon, getOciqGroupAvatar, getOicqAvatar, OicqAvatarSize } from './utils/img'

export default [
	// #region Clarity
	{
		name: '纸鹿楼',
		desc: '纸鹿学长太强了orz',
		// @keep-sorted { "keys": ["date"] }
		entries: [
			// myFeed,
			{
				author: '纸鹿学长',
				sitenick: 'YYDS',
				title: '纸鹿摸鱼处',
				desc: '前端大手子',
				link: 'https://blog.zhilu.site/',
				feed: 'https://blog.zhilu.site/atom.xml',
				icon: 'https://www.zhilu.site/api/avatar.png',
				avatar: 'https://www.zhilu.site/api/avatar.png',
				// archs: ['Nuxt', 'Netlify'],
				date: '2026-03-31',
				comment: '老学长，技术大佬，前端大手子',
			},
		],
	},
	// #endregion
	{
		name: 'CTFer',
		desc: '每日跪拜名单...',
		// @keep-sorted { "keys": ["date"] }
		entries: [
			{
				author: 'chen7chen',
				// sitenick: '大手子',
				title: '小chen妙妙屋',
				desc: '取证+攻防',
				link: 'https://blog.xchstudy.org/',
				icon: 'https://blog.xchstudy.org/img%5Coutput.png',
				avatar: 'https://blog.xchstudy.org/img%5Coutput.png',
				date: '2026-03-31',
				comment: '大一前端，大二取证，大三攻防，tql哥',
			},
			{
				author: 'Vu1n4bly',
				sitenick: 'V爷！',
				title: 'wanTh3flag',
				desc: 'Web大佬',
				link: 'https://wanth3f1ag.top/',
				icon: 'https://wanth3f1ag.top/images/avatar.jpg',
				avatar: 'https://wanth3f1ag.top/images/avatar.jpg',
				date: '2026-03-31',
				comment: '笔记好全好想要，再让我多看一篇吧qwq',
			},
			
		],
	},
	// #endregion
	// #region 知识分享
	{
		name: '好友博客',
		desc: '没有好友，哭了qwq',
		// @keep-sorted { "keys": ["date"] }
		entries: [

		],
	},
	// #endregion
	// #region 漫游
	// {
	// 	name: '漫游',
	// 	desc: '网上冲浪时发现的精彩内容与常读订阅，与君共享。',
	// 	// @keep-sorted { "keys": ["date"] }
	// 	entries: [
	// 	],
	// },
	// #endregion
] satisfies FeedGroup[]
