import { API } from '../../../../../app/api/server';
import { findPriorities, findPriorityById } from './lib/priorities';

API.v1.addRoute(
	'livechat/priorities',
	{ authRequired: true },
	{
		async get() {
			const { offset, count } = this.getPaginationItems();
			const { sort } = this.parseJsonQuery();
			const { text } = this.queryParams;

			return API.v1.success(
				await findPriorities({
					userId: this.userId,
					text,
					pagination: {
						offset,
						count,
						sort,
					},
				}),
			);
		},
	},
);

API.v1.addRoute(
	'livechat/priorities/:priorityId',
	{ authRequired: true },
	{
		async get() {
			const { priorityId } = this.urlParams;

			const priority = await findPriorityById({
				userId: this.userId,
				priorityId,
			});

			if (!priority) {
				return API.v1.notFound(`Priority with id ${priorityId} not found`);
			}

			return API.v1.success(priority);
		},
	},
);
