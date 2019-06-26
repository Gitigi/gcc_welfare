import { observable, action, set, get } from 'mobx'

export class UserStore {
	@observable user = {username: null};

	@action
	setUser(user) {
		set(this.user,user);
	}

	getUser() {
		return get(this.user,'username');
	}
}