import type { Locator, Page } from '@playwright/test';

import { AdminSidenav } from './fragments';
import { AdminFlextab } from './fragments/admin-flextab';

export class Admin {
	private readonly page: Page;

	readonly sidenav: AdminSidenav;

	readonly tabs: AdminFlextab;

	constructor(page: Page) {
		this.page = page;
		this.sidenav = new AdminSidenav(page);
		this.tabs = new AdminFlextab(page);
	}

	get inputSearchRooms(): Locator {
		return this.page.locator('input[placeholder ="Search Rooms"]');
	}

	get inputSearchUsers(): Locator {
		return this.page.locator('input[placeholder="Search Users"]');
	}

	get inputSearchSettings(): Locator {
		return this.page.locator('input[type=search]');
	}

	get inputSiteURL(): Locator {
		return this.page.locator('[data-qa-setting-id="Site_Url"]');
	}

	get btnResetSiteURL(): Locator {
		return this.page.locator('//label[@title="Site_Url"]//following-sibling::button');
	}

	get inputSiteName(): Locator {
		return this.page.locator('[data-qa-setting-id="Site_Name"]');
	}

	get btnResetSiteName(): Locator {
		return this.page.locator('[data-qa-reset-setting-id="Site_Name"]');
	}

	get btnAllowInvalidSelfSignedCerts(): Locator {
		return this.page.locator('//label[@data-qa-setting-id="Allow_Invalid_SelfSigned_Certs"]//i');
	}

	get btnResetAllowInvalidSelfSignedCerts(): Locator {
		return this.page.locator('//button[@data-qa-reset-setting-id="Allow_Invalid_SelfSigned_Certs"]');
	}

	get btnEnableFavoriteRooms(): Locator {
		return this.page.locator('[data-qa-setting-id="Favorite_Rooms"]');
	}

	get btnResetEnableFavoriteRooms(): Locator {
		return this.page.locator('[data-qa-reset-setting-id="Favorite_Rooms"]');
	}

	get btnUseCDNPrefix(): Locator {
		return this.page.locator('[data-qa-setting-id="CDN_PREFIX_ALL"]');
	}

	get btnResetUseCDNPrefix(): Locator {
		return this.page.locator('[data-qa-reset-setting-id="CDN_PREFIX_ALL"]');
	}

	get btnForceSSL(): Locator {
		return this.page.locator('[data-qa-setting-id="Force_SSL"]');
	}

	get btnResetForceSSL(): Locator {
		return this.page.locator('[data-qa-reset-setting-id="Force_SSL"]');
	}

	get inputGoogleTagManagerId(): Locator {
		return this.page.locator('[data-qa-setting-id="GoogleTagManager_id"]');
	}

	get btnResetGoogleTagManagerId(): Locator {
		return this.page.locator('[data-qa-reset-setting-id="GoogleTagManager_id"]');
	}

	get inputBugsnagApiKey(): Locator {
		return this.page.locator('[data-qa-setting-id="Bugsnag_api_key"]');
	}

	get inputResetBugsnagApiKey(): Locator {
		return this.page.locator('[data-qa-reset-setting-id="Bugsnag_api_key"]');
	}

	get inputRobotsFileContent(): Locator {
		return this.page.locator('#Robot_Instructions_File_Content');
	}

	get btnResetRobotsFileContent(): Locator {
		return this.page.locator('[data-qa-reset-setting-id="Robot_Instructions_File_Content"]');
	}
}
