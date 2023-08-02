import { LivechatVisitors, Messages, LivechatRooms, LivechatCustomField } from '@rocket.chat/models';

import { canAccessRoomAsync } from '../../../../authorization/server/functions/canAccessRoom';

export async function findVisitorInfo({ visitorId }) {
	const visitor = await LivechatVisitors.findOneById(visitorId);
	if (!visitor) {
		throw new Error('visitor-not-found');
	}

	return {
		visitor,
	};
}

export async function findVisitedPages({ roomId, pagination: { offset, count, sort } }) {
	const room = await LivechatRooms.findOneById(roomId);
	if (!room) {
		throw new Error('invalid-room');
	}
	const { cursor, totalCount } = Messages.findPaginatedByRoomIdAndType(room._id, 'livechat_navigation_history', {
		sort: sort || { ts: -1 },
		skip: offset,
		limit: count,
	});

	const [pages, total] = await Promise.all([cursor.toArray(), totalCount]);

	return {
		pages,
		count: pages.length,
		offset,
		total,
	};
}

export async function findChatHistory({ userId, roomId, visitorId, pagination: { offset, count, sort } }) {
	const room = await LivechatRooms.findOneById(roomId);
	if (!room) {
		throw new Error('invalid-room');
	}
	if (!(await canAccessRoomAsync(room, { _id: userId }))) {
		throw new Error('error-not-allowed');
	}

	const { cursor, totalCount } = LivechatRooms.findPaginatedByVisitorId(visitorId, {
		sort: sort || { ts: -1 },
		skip: offset,
		limit: count,
	});

	const [history, total] = await Promise.all([cursor.toArray(), totalCount]);

	return {
		history,
		count: history.length,
		offset,
		total,
	};
}

export async function searchChats({
	userId,
	roomId,
	visitorId,
	searchText,
	closedChatsOnly,
	servedChatsOnly: served,
	pagination: { offset, count, sort },
}) {
	const room = await LivechatRooms.findOneById(roomId);
	if (!room) {
		throw new Error('invalid-room');
	}

	if (!(await canAccessRoomAsync(room, { _id: userId }))) {
		throw new Error('error-not-allowed');
	}

	const options = {
		sort: sort || { ts: -1 },
		skip: offset,
		limit: count,
	};

	const [total] = await LivechatRooms.findRoomsByVisitorIdAndMessageWithCriteria({
		visitorId,
		open: closedChatsOnly !== 'true',
		served: served !== 'true',
		searchText,
		onlyCount: true,
	}).toArray();
	const cursor = await LivechatRooms.findRoomsByVisitorIdAndMessageWithCriteria({
		visitorId,
		open: closedChatsOnly === 'true',
		served: served === 'true',
		searchText,
		options,
	});

	const history = await cursor.toArray();

	return {
		history,
		count: history.length,
		offset,
		total: (total && total.count) || 0,
	};
}

export async function findVisitorsToAutocomplete({ selector }) {
	const { exceptions = [], conditions = {} } = selector;

	const options = {
		projection: {
			_id: 1,
			name: 1,
			username: 1,
		},
		limit: 10,
		sort: {
			name: 1,
		},
	};

	const items = await LivechatVisitors.findByNameRegexWithExceptionsAndConditions(selector.term, exceptions, conditions, options).toArray();
	return {
		items,
	};
}

export async function findVisitorsByEmailOrPhoneOrNameOrUsernameOrCustomField({
	emailOrPhone,
	nameOrUsername,
	pagination: { offset, count, sort },
}) {
	const allowedCF = await LivechatCustomField.findMatchingCustomFields('visitor', true, { projection: { _id: 1 } })
		.map((cf) => cf._id)
		.toArray();

	const { cursor, totalCount } = await LivechatVisitors.findPaginatedVisitorsByEmailOrPhoneOrNameOrUsernameOrCustomField(
		emailOrPhone,
		nameOrUsername,
		allowedCF,
		{
			sort: sort || { ts: -1 },
			skip: offset,
			limit: count,
			projection: {
				username: 1,
				name: 1,
				phone: 1,
				livechatData: 1,
				visitorEmails: 1,
				lastChat: 1,
			},
		},
	);

	const [visitors, total] = await Promise.all([cursor.toArray(), totalCount]);

	return {
		visitors,
		count: visitors.length,
		offset,
		total,
	};
}
