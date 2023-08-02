import { onToggledFeature } from '../../app/license/server/license';

onToggledFeature('device-management', {
	up: async () => {
		const { createPermissions, createEmailTemplates, createDeviceManagementModal } = await import('../lib/deviceManagement/startup');
		const { listenSessionLogin } = await import('../lib/deviceManagement/session');

		await createPermissions();
		await createEmailTemplates();
		await listenSessionLogin();

		await createDeviceManagementModal();
	},
});
