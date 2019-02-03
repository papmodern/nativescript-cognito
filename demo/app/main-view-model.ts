import {Observable} from 'tns-core-modules/data/observable';
import {Cognito} from 'nativescript-cognito';

export class HelloWorldModel extends Observable {
    private cognito: Cognito;

    constructor() {
        super();
        this.init();
    }

    async init() {
        this.cognito = new Cognito("pool-id", "client-id");

        const attributes = {
            email: "mail@gmail.com",
            nickname: "nickname",
            phone_number: "+123456789",
        };

        try {
            // let data = await this.cognito.signUp("username", "password", {email: "email@gmail.com"});
            // console.log(data);
            // let user = await this.cognito.resendCode("username");
            // console.log(user);
            let data = await this.cognito.authenticate("username", "password");
            console.log(data);
            let user = await this.cognito.changePassword("username", "password", "newPassword");
            console.log(user);
            let details = await this.cognito.getUserDetails();
            console.log(details.attributes);
            console.log(details.settings);
            await this.cognito.logout();

        } catch (e) {
            console.log(e);
        }
    }
}
