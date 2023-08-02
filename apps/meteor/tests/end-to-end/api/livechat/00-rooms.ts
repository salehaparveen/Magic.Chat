/* eslint-env mocha */

import fs from 'fs';
import path from 'path';

import { expect } from 'chai';
import type { IOmnichannelRoom, ILivechatVisitor, IUser, IOmnichannelSystemMessage } from '@rocket.chat/core-typings';
import type { Response } from 'supertest';

import { getCredentials, api, request, credentials } from '../../../data/api-data';
import {
	createVisitor,
	createLivechatRoom,
	createAgent,
	makeAgentAvailable,
	getLivechatRoomInfo,
	sendMessage,
} from '../../../data/livechat/rooms';
import { updatePermission, updateSetting } from '../../../data/permissions.helper';
import { createUser, login } from '../../../data/users.helper.js';
import { adminUsername, password } from '../../../data/user.js';
import { createDepartmentWithAnOnlineAgent } from '../../../data/livechat/department';

describe('LIVECHAT - rooms', function () {
	this.retries(0);
	let visitor: ILivechatVisitor;
	let room: IOmnichannelRoom;

	before((done) => getCredentials(done));

	before((done) => {
		updateSetting('Livechat_enabled', true).then(() => {
			createAgent()
				.then(() => makeAgentAvailable())
				.then(() => createVisitor())
				.then((createdVisitor) => {
					visitor = createdVisitor;
					return createLivechatRoom(createdVisitor.token);
				})
				.then((createdRoom) => {
					room = createdRoom;
					done();
				});
		});
	});

	describe('livechat/rooms', () => {
		it('should return an "unauthorized error" when the user does not have the necessary permission', (done) => {
			updatePermission('view-livechat-rooms', []).then(() => {
				request
					.get(api('livechat/rooms'))
					.set(credentials)
					.expect('Content-Type', 'application/json')
					.expect(403)
					.expect((res: Response) => {
						expect(res.body).to.have.property('success', false);
						expect(res.body.error).to.be.equal('unauthorized');
					})
					.end(done);
			});
		});
		it('should return an error when the "agents" query parameter is not valid', (done) => {
			updatePermission('view-livechat-rooms', ['admin']).then(() => {
				request
					.get(api('livechat/rooms?agents=invalid'))
					.set(credentials)
					.expect('Content-Type', 'application/json')
					.expect(400)
					.expect((res: Response) => {
						expect(res.body).to.have.property('success', false);
					})
					.end(done);
			});
		});
		it('should return an error when the "roomName" query parameter is not valid', (done) => {
			request
				.get(api('livechat/rooms?roomName[]=invalid'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', false);
				})
				.end(done);
		});
		it('should return an error when the "departmentId" query parameter is not valid', (done) => {
			request
				.get(api('livechat/rooms?departmentId[]=marcos'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', false);
				})
				.end(done);
		});
		it('should return an error when the "open" query parameter is not valid', (done) => {
			request
				.get(api('livechat/rooms?open[]=true'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', false);
				})
				.end(done);
		});
		it('should return an error when the "tags" query parameter is not valid', (done) => {
			request
				.get(api('livechat/rooms?tags=invalid'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', false);
				})
				.end(done);
		});
		it('should return an error when the "createdAt" query parameter is not valid', (done) => {
			request
				.get(api('livechat/rooms?createdAt=invalid'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', false);
				})
				.end(done);
		});
		it('should return an error when the "closedAt" query parameter is not valid', (done) => {
			request
				.get(api('livechat/rooms?closedAt=invalid'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', false);
				})
				.end(done);
		});
		it('should return an error when the "customFields" query parameter is not valid', (done) => {
			request
				.get(api('livechat/rooms?customFields=invalid'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', false);
				})
				.end(done);
		});
		it('should return an array of rooms when has no parameters', (done) => {
			request
				.get(api('livechat/rooms'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body.rooms).to.be.an('array');
					expect(res.body).to.have.property('offset');
					expect(res.body).to.have.property('total');
					expect(res.body).to.have.property('count');
				})
				.end(done);
		});
		it('should return an array of rooms when the query params is all valid', (done) => {
			request
				.get(
					api(`livechat/rooms?agents[]=teste&departamentId=123&open=true&createdAt={"start": "2018-01-26T00:11:22.345Z", "end": "2018-01-26T00:11:22.345Z"}
			&closedAt={"start": "2018-01-26T00:11:22.345Z", "end": "2018-01-26T00:11:22.345Z"}&tags[]=rocket
			&customFields={"docId": "031041"}&count=3&offset=1&sort={"_updatedAt": 1}&fields={"msgs": 0}&roomName=test`),
				)
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body.rooms).to.be.an('array');
					expect(res.body).to.have.property('offset');
					expect(res.body).to.have.property('total');
					expect(res.body).to.have.property('count');
				})
				.end(done);
		});
	});

	describe('livechat/room.close', () => {
		it('should return an "invalid-token" error when the visitor is not found due to an invalid token', (done) => {
			request
				.post(api('livechat/room.close'))
				.set(credentials)
				.send({
					token: 'invalid-token',
					rid: room._id,
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', false);
					expect(res.body.error).to.be.equal('invalid-token');
				})
				.end(done);
		});

		it('should return an "invalid-room" error when the room is not found due to invalid token and/or rid', (done) => {
			request
				.post(api('livechat/room.close'))
				.set(credentials)
				.send({
					token: visitor.token,
					rid: 'invalid-rid',
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', false);
					expect(res.body.error).to.be.equal('invalid-room');
				})
				.end(done);
		});

		it('should return both the rid and the comment of the room when the query params is all valid', (done) => {
			request
				.post(api(`livechat/room.close`))
				.set(credentials)
				.send({
					token: visitor.token,
					rid: room._id,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.property('rid');
					expect(res.body).to.have.property('comment');
				})
				.end(done);
		});

		it('should return an "room-closed" error when the room is already closed', (done) => {
			request
				.post(api('livechat/room.close'))
				.set(credentials)
				.send({
					token: visitor.token,
					rid: room._id,
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', false);
					expect(res.body.error).to.be.equal('room-closed');
				})
				.end(done);
		});
	});

	describe('livechat/room.forward', () => {
		it('should return an "unauthorized error" when the user does not have "view-l-room" permission', async () => {
			await updatePermission('transfer-livechat-guest', ['admin']);
			await updatePermission('view-l-room', []);

			await request
				.post(api('livechat/room.forward'))
				.set(credentials)
				.send({
					roomId: 'invalid-room-id',
				})
				.expect('Content-Type', 'application/json')
				.expect(403)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', false);
					expect(res.body.error).to.have.string('unauthorized');
				});
		});

		it('should return an "unauthorized error" when the user does not have "transfer-livechat-guest" permission', async () => {
			await updatePermission('transfer-livechat-guest', []);
			await updatePermission('view-l-room', ['admin']);

			await request
				.post(api('livechat/room.forward'))
				.set(credentials)
				.send({
					roomId: 'invalid-room-id',
				})
				.expect('Content-Type', 'application/json')
				.expect(403)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', false);
					expect(res.body.error).to.have.string('unauthorized');
				});
		});

		it('should not be successful when no target (userId or departmentId) was specified', async () => {
			await updatePermission('transfer-livechat-guest', ['admin']);
			await updatePermission('view-l-room', ['admin']);

			await request
				.post(api('livechat/room.forward'))
				.set(credentials)
				.send({
					roomId: room._id,
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', false);
				});
		});

		it('should return a success message when transferred successfully to agent', async () => {
			const initialAgentAssignedToChat: IUser = await createUser();
			const initialAgentCredentials = await login(initialAgentAssignedToChat.username, password);
			await createAgent(initialAgentAssignedToChat.username);
			await makeAgentAvailable(initialAgentCredentials);

			const newVisitor = await createVisitor();
			// at this point, the chat will get transferred to agent "user"
			const newRoom = await createLivechatRoom(newVisitor.token);

			const forwardChatToUser: IUser = await createUser();
			const forwardChatToUserCredentials = await login(forwardChatToUser.username, password);
			await createAgent(forwardChatToUser.username);
			await makeAgentAvailable(forwardChatToUserCredentials);

			await request
				.post(api('livechat/room.forward'))
				.set(credentials)
				.send({
					roomId: newRoom._id,
					userId: forwardChatToUser._id,
					clientAction: true,
					comment: 'test comment',
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', true);
				});

			const latestRoom = await getLivechatRoomInfo(newRoom._id);

			expect(latestRoom).to.have.property('lastMessage');
			expect(latestRoom.lastMessage?.t).to.be.equal('livechat_transfer_history');
			expect(latestRoom.lastMessage?.u?.username).to.be.equal(adminUsername);
			const { lastMessage } = latestRoom as { lastMessage: IOmnichannelSystemMessage };
			expect(lastMessage?.transferData?.comment).to.be.equal('test comment');
			expect(lastMessage?.transferData?.scope).to.be.equal('agent');
			expect(lastMessage?.transferData?.transferredTo?.username).to.be.equal(forwardChatToUser.username);
		});

		it('should return a success message when transferred successfully to a department', async () => {
			const { department: initialDepartment } = await createDepartmentWithAnOnlineAgent();
			const { department: forwardToDepartment } = await createDepartmentWithAnOnlineAgent();

			const newVisitor = await createVisitor(initialDepartment._id);
			const newRoom = await createLivechatRoom(newVisitor.token);

			await request
				.post(api('livechat/room.forward'))
				.set(credentials)
				.send({
					roomId: newRoom._id,
					departmentId: forwardToDepartment._id,
					clientAction: true,
					comment: 'test comment',
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', true);
				});

			const latestRoom = await getLivechatRoomInfo(newRoom._id);

			expect(latestRoom).to.have.property('departmentId');
			expect(latestRoom.departmentId).to.be.equal(forwardToDepartment._id);

			expect(latestRoom).to.have.property('lastMessage');
			expect(latestRoom.lastMessage?.t).to.be.equal('livechat_transfer_history');
			expect(latestRoom.lastMessage?.u?.username).to.be.equal(adminUsername);
			expect((latestRoom.lastMessage as any)?.transferData?.comment).to.be.equal('test comment');
			expect((latestRoom.lastMessage as any)?.transferData?.scope).to.be.equal('department');
			expect((latestRoom.lastMessage as any)?.transferData?.nextDepartment?._id).to.be.equal(forwardToDepartment._id);
		});
	});

	describe('livechat/room.survey', () => {
		it('should return an "invalid-token" error when the visitor is not found due to an invalid token', (done) => {
			request
				.post(api('livechat/room.survey'))
				.set(credentials)
				.send({
					token: 'invalid-token',
					rid: room._id,
					data: [{ name: 'question', value: 'answer' }],
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', false);
					expect(res.body.error).to.be.equal('[invalid-token]');
				})
				.end(done);
		});

		it('should return an "invalid-room" error when the room is not found due to invalid token and/or rid', (done) => {
			request
				.post(api('livechat/room.survey'))
				.set(credentials)
				.send({
					token: visitor.token,
					rid: 'invalid-rid',
					data: [{ name: 'question', value: 'answer' }],
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', false);
					expect(res.body.error).to.be.equal('[invalid-room]');
				})
				.end(done);
		});

		it('should return "invalid-data" when the items answered are not part of config.survey.items', (done) => {
			request
				.post(api('livechat/room.survey'))
				.set(credentials)
				.send({
					token: visitor.token,
					rid: room._id,
					data: [{ name: 'question', value: 'answer' }],
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', false);
					expect(res.body.error).to.be.equal('[invalid-data]');
				})
				.end(done);
		});

		it('should return the room id and the answers when the query params is all valid', (done) => {
			request
				.post(api('livechat/room.survey'))
				.set(credentials)
				.send({
					token: visitor.token,
					rid: room._id,
					data: [
						{ name: 'satisfaction', value: '5' },
						{ name: 'agentKnowledge', value: '3' },
					],
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.property('rid');
					expect(res.body).to.have.property('data');
					expect(res.body.data.satisfaction).to.be.equal('5');
					expect(res.body.data.agentKnowledge).to.be.equal('3');
				})
				.end(done);
		});
	});

	describe('livechat/upload/:rid', () => {
		it('should throw an error if x-visitor-token header is not present', (done) => {
			request
				.post(api('livechat/upload/test'))
				.set(credentials)
				.attach('file', fs.createReadStream(path.join(__dirname, '../../../data/livechat/sample.png')))
				.expect('Content-Type', 'application/json')
				.expect(403)
				.end(done);
		});

		it('should throw an error if x-visitor-token is present but with an invalid value', (done) => {
			request
				.post(api('livechat/upload/test'))
				.set(credentials)
				.set('x-visitor-token', 'invalid-token')
				.attach('file', fs.createReadStream(path.join(__dirname, '../../../data/livechat/sample.png')))
				.expect('Content-Type', 'application/json')
				.expect(403)
				.end(done);
		});

		it('should throw unauthorized if visitor with token exists but room is invalid', (done) => {
			createVisitor()
				.then((visitor) => {
					request
						.post(api('livechat/upload/test'))
						.set(credentials)
						.set('x-visitor-token', visitor.token)
						.attach('file', fs.createReadStream(path.join(__dirname, '../../../data/livechat/sample.png')))
						.expect('Content-Type', 'application/json')
						.expect(403);
				})
				.then(() => done());
		});

		it('should throw an error if the file is not attached', (done) => {
			createVisitor()
				.then((visitor) => {
					request
						.post(api('livechat/upload/test'))
						.set(credentials)
						.set('x-visitor-token', visitor.token)
						.expect('Content-Type', 'application/json')
						.expect(400);
				})
				.then(() => done());
		});

		it('should upload an image on the room if all params are valid', (done) => {
			createVisitor()
				.then((visitor) => Promise.all([visitor, createLivechatRoom(visitor.token)]))
				.then(([visitor, room]) => {
					request
						.post(api(`livechat/upload/${room._id}`))
						.set(credentials)
						.set('x-visitor-token', visitor.token)
						.attach('file', fs.createReadStream(path.join(__dirname, '../../../data/livechat/sample.png')))
						.expect('Content-Type', 'application/json')
						.expect(200);
				})
				.then(() => done());
		});
	});

	describe('livechat/:rid/messages', () => {
		it('should fail if room provided is invalid', (done) => {
			request.get(api('livechat/test/messages')).set(credentials).expect('Content-Type', 'application/json').expect(400).end(done);
		});
		it('should throw an error if user doesnt have permission view-l-room', async () => {
			await updatePermission('view-l-room', []);

			await request.get(api('livechat/test/messages')).set(credentials).expect('Content-Type', 'application/json').expect(403);
		});
		it('should return the messages of the room', async () => {
			await updatePermission('view-l-room', ['admin']);
			const visitor = await createVisitor();
			const room = await createLivechatRoom(visitor.token);
			await sendMessage(room._id, 'Hello', visitor.token);

			const { body } = await request
				.get(api(`livechat/${room._id}/messages`))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(200);

			expect(body).to.have.property('success', true);
			expect(body).to.have.property('messages');
			expect(body.messages).to.be.an('array');
			expect(body.total).to.be.an('number').equal(1);
			expect(body.messages[0]).to.have.property('msg', 'Hello');
		});
	});

	describe('[GET] livechat/message/:_id', () => {
		it('should fail if message provided is invalid', async () => {
			await request.get(api('livechat/message/test')).set(credentials).expect('Content-Type', 'application/json').expect(400);
		});
		it('shoudl fail if token is not sent as query param', async () => {
			await request.get(api('livechat/message/test')).set(credentials).expect('Content-Type', 'application/json').expect(400);
		});
		it('should fail if rid is not sent as query param', async () => {
			await request
				.get(api('livechat/message/test'))
				.set(credentials)
				.query({ token: 'test' })
				.expect('Content-Type', 'application/json')
				.expect(400);
		});
		it('should return the message', async () => {
			const visitor = await createVisitor();
			const room = await createLivechatRoom(visitor.token);
			const message = await sendMessage(room._id, 'Hello', visitor.token);

			const { body } = await request
				.get(api(`livechat/message/${message._id}`))
				.query({
					token: visitor.token,
					rid: room._id,
				})
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(200);

			expect(body).to.have.property('success', true);
			expect(body).to.have.property('message');
			expect(body.message).to.have.property('msg', 'Hello');
		});
	});

	describe('[PUT] livechat/message/:_id', () => {
		it('should fail if room provided is invalid', async () => {
			await request
				.put(api('livechat/message/test'))
				.set(credentials)
				.send({ token: 'test', rid: 'fadsfdsafads', msg: 'fasfasdfdsf' })
				.expect('Content-Type', 'application/json')
				.expect(400);
		});
		it('should fail if token is not sent as body param', async () => {
			await request
				.put(api('livechat/message/test'))
				.set(credentials)
				.send({ msg: 'fasfadsf', rid: 'afdsfdsfads' })
				.expect('Content-Type', 'application/json')
				.expect(400);
		});
		it('should fail if rid is not sent as body param', async () => {
			await request
				.put(api('livechat/message/test'))
				.set(credentials)
				.send({ token: 'test', msg: 'fasfasdfdsf' })
				.expect('Content-Type', 'application/json')
				.expect(400);
		});
		it('should fail if msg is not sent as body param', async () => {
			await request
				.put(api(`livechat/message/test`))
				.set(credentials)
				.send({ token: 'fasdfdsf', rid: 'fadsfdsafads' })
				.expect('Content-Type', 'application/json')
				.expect(400);
		});
		it('should fail if token is not a valid token', async () => {
			await request
				.put(api(`livechat/message/test`))
				.set(credentials)
				.send({ token: 'test', rid: 'fadsfdsafads', msg: 'fasfasdfdsf' })
				.expect('Content-Type', 'application/json')
				.expect(400);
		});
		it('should fail if room is not a valid room', async () => {
			const visitor = await createVisitor();
			await request
				.put(api(`livechat/message/test`))
				.set(credentials)
				.send({ token: visitor.token, rid: 'fadsfdsafads', msg: 'fasfasdfdsf' })
				.expect('Content-Type', 'application/json')
				.expect(400);
		});
		it('should fail if _id is not a valid message id', async () => {
			const visitor = await createVisitor();
			const room = await createLivechatRoom(visitor.token);

			await request
				.put(api(`livechat/message/test`))
				.set(credentials)
				.send({ token: visitor.token, rid: room._id, msg: 'fasfasdfdsf' })
				.expect('Content-Type', 'application/json')
				.expect(400);
		});
		it('should update a message if everything is valid', async () => {
			const visitor = await createVisitor();
			const room = await createLivechatRoom(visitor.token);
			const message = await sendMessage(room._id, 'Hello', visitor.token);

			const { body } = await request
				.put(api(`livechat/message/${message._id}`))
				.set(credentials)
				.send({ token: visitor.token, rid: room._id, msg: 'Hello World' })
				.expect('Content-Type', 'application/json')
				.expect(200);

			expect(body).to.have.property('success', true);
			expect(body).to.have.property('message');
			expect(body.message).to.have.property('msg', 'Hello World');
			expect(body.message).to.have.property('editedAt');
			expect(body.message).to.have.property('editedBy');
			expect(body.message.editedBy).to.have.property('username', visitor.username);
		});
	});

	describe('[DELETE] livechat/message/_id', () => {
		it('should fail if token is not sent as body param', async () => {
			await request
				.delete(api('livechat/message/test'))
				.set(credentials)
				.send({ rid: 'afdsfdsfads' })
				.expect('Content-Type', 'application/json')
				.expect(400);
		});
		it('should fail if room provided is invalid', async () => {
			await request
				.delete(api('livechat/message/test'))
				.set(credentials)
				.send({ token: 'test', rid: 'fadsfdsafads' })
				.expect('Content-Type', 'application/json')
				.expect(400);
		});
		it('should fail if rid is not sent as body param', async () => {
			await request
				.delete(api('livechat/message/test'))
				.set(credentials)
				.send({ token: 'test' })
				.expect('Content-Type', 'application/json')
				.expect(400);
		});
		it('should fail if _id is not a valid message id', async () => {
			const visitor = await createVisitor();
			const room = await createLivechatRoom(visitor.token);

			await request
				.delete(api(`livechat/message/test`))
				.set(credentials)
				.send({ token: visitor.token, rid: room._id })
				.expect('Content-Type', 'application/json')
				.expect(400);
		});
		it('should delete a message if everything is valid', async () => {
			const visitor = await createVisitor();
			const room = await createLivechatRoom(visitor.token);
			const message = await sendMessage(room._id, 'Hello', visitor.token);

			const { body } = await request
				.delete(api(`livechat/message/${message._id}`))
				.set(credentials)
				.send({ token: visitor.token, rid: room._id })
				.expect('Content-Type', 'application/json')
				.expect(200);

			expect(body).to.have.property('success', true);
			expect(body).to.have.property('message');
			expect(body.message).to.have.property('_id', message._id);
			expect(body.message).to.have.property('ts');
		});
	});

	describe('livechat/messages.history/rid', () => {
		it('should fail if token is not sent as query param', async () => {
			await request.get(api('livechat/messages.history/test')).set(credentials).expect('Content-Type', 'application/json').expect(400);
		});
		it('should fail if token is not a valid guest token', async () => {
			await request
				.get(api('livechat/messages.history/test'))
				.set(credentials)
				.query({ token: 'test' })
				.expect('Content-Type', 'application/json')
				.expect(400);
		});
		it('should fail if token is good, but rid is not valid', async () => {
			const visitor = await createVisitor();
			await request
				.get(api('livechat/messages.history/fadsfdsafads'))
				.set(credentials)
				.query({ token: visitor.token })
				.expect('Content-Type', 'application/json')
				.expect(400);
		});
		it('should return message history for a valid room', async () => {
			const visitor = await createVisitor();
			const room = await createLivechatRoom(visitor.token);
			await sendMessage(room._id, 'Hello', visitor.token);

			const { body } = await request
				.get(api(`livechat/messages.history/${room._id}`))
				.set(credentials)
				.query({ token: visitor.token })
				.expect('Content-Type', 'application/json')
				.expect(200);

			expect(body).to.have.property('success', true);
			expect(body).to.have.property('messages');
			expect(body.messages).to.be.an('array');
			expect(body.messages.length <= 3).to.be.true;
			expect(body.messages[0]).to.have.property('msg', 'Hello');
			expect(body.messages[1]).to.have.property('t');
		});
		it('should return message history for a valid room with pagination', async () => {
			const visitor = await createVisitor();
			const room = await createLivechatRoom(visitor.token);
			await sendMessage(room._id, 'Hello', visitor.token);

			const { body } = await request
				.get(api(`livechat/messages.history/${room._id}`))
				.set(credentials)
				.query({ token: visitor.token, limit: 1 })
				.expect('Content-Type', 'application/json')
				.expect(200);

			expect(body).to.have.property('success', true);
			expect(body).to.have.property('messages').of.length(1);
			expect(body.messages[0]).to.have.property('msg', 'Hello');
		});
		it('should return message history for a valid room with pagination and offset', async () => {
			const visitor = await createVisitor();
			const room = await createLivechatRoom(visitor.token);
			await sendMessage(room._id, 'Hello', visitor.token);

			const { body } = await request
				.get(api(`livechat/messages.history/${room._id}`))
				.set(credentials)
				.query({ token: visitor.token, limit: 1, offset: 1 })
				.expect('Content-Type', 'application/json')
				.expect(200);

			expect(body).to.have.property('success', true);
			expect(body).to.have.property('messages').of.length(1);
			expect(body.messages[0]).to.have.property('t');
		});
		it('should return message history for a valid date filtering (max date)', async () => {
			const visitor = await createVisitor();
			const room = await createLivechatRoom(visitor.token);
			await sendMessage(room._id, 'Hello', visitor.token);
			const sendMessageTs = new Date();
			await sendMessage(room._id, 'Hello2', visitor.token);

			const { body } = await request
				.get(api(`livechat/messages.history/${room._id}`))
				.set(credentials)
				.query({ token: visitor.token, end: sendMessageTs.toISOString() })
				.expect('Content-Type', 'application/json')
				.expect(200);

			expect(body).to.have.property('success', true);
			expect(body).to.have.property('messages').that.is.an('array');
			expect(body.messages.length <= 3).to.be.true;
			expect(body.messages[0]).to.have.property('msg', 'Hello');
			expect(body.messages[1]).to.have.property('t');
		});
	});

	describe('livechat/messages', () => {
		it('should fail if visitor is not sent as body param', async () => {
			await request.post(api('livechat/messages')).set(credentials).expect('Content-Type', 'application/json').expect(400);
		});

		it('should fail if visitor.token is not sent as body param', async () => {
			await request
				.post(api('livechat/messages'))
				.set(credentials)
				.send({ visitor: {} })
				.expect('Content-Type', 'application/json')
				.expect(400);
		});

		it('should fail if messages is not sent as body param', async () => {
			await request
				.post(api('livechat/messages'))
				.set(credentials)
				.send({ visitor: { token: 'test' } })
				.expect('Content-Type', 'application/json')
				.expect(400);
		});

		it('should fail if messages is not an array', async () => {
			await request
				.post(api('livechat/messages'))
				.set(credentials)
				.send({ visitor: { token: 'test' }, messages: {} })
				.expect('Content-Type', 'application/json')
				.expect(400);
		});

		it('should fail if messages is an empty array', async () => {
			await request
				.post(api('livechat/messages'))
				.set(credentials)
				.send({ visitor: { token: 'test' }, messages: [] })
				.expect('Content-Type', 'application/json')
				.expect(400);
		});

		it('should be able to create messages on a room', async () => {
			const visitor = await createVisitor();
			const room = await createLivechatRoom(visitor.token);
			await sendMessage(room._id, 'Hello', visitor.token);

			const { body } = await request
				.post(api('livechat/messages'))
				.set(credentials)
				.send({ visitor: { token: visitor.token }, messages: [{ msg: 'Hello' }, { msg: 'Hello 2' }] })
				.expect('Content-Type', 'application/json')
				.expect(200);

			expect(body).to.have.property('success', true);
			expect(body).to.have.property('messages').of.length(2);
			expect(body.messages[0]).to.have.property('msg', 'Hello');
			expect(body.messages[0]).to.have.property('ts');
			expect(body.messages[0]).to.have.property('username', visitor.username);
			expect(body.messages[1]).to.have.property('msg', 'Hello 2');
			expect(body.messages[1]).to.have.property('ts');
			expect(body.messages[1]).to.have.property('username', visitor.username);
		});
	});
});
