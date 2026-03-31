import type { FeedGroup } from '../app/types/feed'
// 友链检测 CLI 需要使用显式导入和相对路径
import { myFeed } from '../blog.config'
// eslint-disable-next-line unused-imports/no-unused-imports
import { getFavicon, getGithubAvatar, getGithubIcon, getOciqGroupAvatar, getOicqAvatar, OicqAvatarSize } from './utils/img'

export default [
	// #region Clarity
	{
		name: '清晰体验',
		desc: '纸鹿学长太强了orz。',
		// @keep-sorted { "keys": ["date"] }
		entries: [
			myFeed,
			{
				author: '纸鹿学长',
				sitenick: '纸鹿摸鱼处',
				title: '古怪杂记本',
				desc: '一个什么都可能会写的博客',
				link: 'https://blog.guuguai.site/',
				feed: 'https://blog.guuguai.site/atom.xml',
				icon: 'https://cravatar.cn/avatar/646331BFF8F19A0E05679C3CC0FC54D6',
				avatar: 'https://cdn.libravatar.org/avatar/646331bff8f19a0e05679c3cc0fc54d6?s=160',
				archs: ['Nuxt', 'Netlify'],
				date: '2023-12-23',
				comment: '高中同学，技术好友，爱好番剧/折腾。',
			},
		],
	},
	// #endregion
	{
		name: 'CTFer',
		desc: '依旧每日跪拜名单...',
		// @keep-sorted { "keys": ["date"] }
		entries: [
			{
				author: 'isYangs',
				desc: '一个前端Bug构造师的博客',
				link: 'https://www.isyangs.cn/',
				feed: 'https://www.isyangs.cn/feed.xml',
				icon: 'https://www.isyangs.cn/favicon.svg',
				avatar: 'https://7.isyangs.cn/8/655c9835780a0-8.jpg',
				archs: ['Vue', '国内 CDN'],
				date: '2024-01-29',
				comment: '高中时认识的小学校友，目前从事前端开发。',
			},
		],
	},
	// #endregion
	// #region 知识分享
	{
		name: '知识分享',
		desc: '“AI时代”创作分享/知识内容收集。',
		// @keep-sorted { "keys": ["date"] }
		entries: [
			{
				author: '茂茂物语',
				desc: '茂茂的成长之路，包含前端常用知识、源码阅读笔记、各种奇淫技巧、日常提效工具等',
				link: 'https://notes.fe-mm.com/',
				icon: getGithubIcon('maomao1996'),
				avatar: getGithubAvatar('maomao1996'),
				archs: ['VitePress', 'Cloudflare'],
				date: '2024-02-17',
				comment: '前端开发笔记。',
			},
		],
	},
	// #endregion
	// #region 漫游
	{
		name: '漫游',
		desc: '网上冲浪时发现的精彩内容与常读订阅，与君共享。',
		// @keep-sorted { "keys": ["date"] }
		entries: [
			{
				author: '风记星辰',
				desc: '热爱你来过的每度温暖',
				feed: 'https://www.thyuu.com/feed',
				link: 'https://www.thyuu.com/',
				icon: 'https://std.thyuu.com/logo.svg',
				avatar: 'https://std.thyuu.com/logo.svg',
				archs: ['WordPress', '服务器'],
				date: '2024-02-01',
			},
		],
	},
	// #endregion
] satisfies FeedGroup[]
