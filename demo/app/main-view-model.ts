import {Observable} from 'tns-core-modules/data/observable';
import {Cognito} from 'nativescript-cognito';
import {categories} from "tns-core-modules/trace";
import Debug = categories.Debug;

export class HelloWorldModel extends Observable {
    private cognito: Cognito;
    private email: string = "";
    private password: string = "";
    private confirm: string = "";

    constructor() {
        super();
        this.init();
    }

    init() {
        this.cognito = new Cognito("pool-id", "client-id");
    }

    async login() {
        try {
            console.log("Hello");
            let data = await this.cognito.authenticate(this.email, this.password);
            let details = await this.cognito.getUserDetails();
            console.log(data);
            console.log(details.attributes);
            console.log(details.settings);
        } catch (e) {
            console.log(e);
        }
    }

    async active() {
        try {
            let data = await this.cognito.confirmRegistration(this.email, this.confirm);
            console.log(data);
        } catch (e) {
            console.log(e);
        }
    }

    async register() {

        const attributes = {
            email: "mail@gmail.com",
            nickname: "nickname",
            phone_number: "+123456789",
        };

        try {
            let data = await this.cognito.signUp(this.email, this.password, attributes);
            console.log(data);

        } catch (e) {
            console.log(e);
        }
    }

    async forgot() {
        try {
            let data = await this.cognito.forgotPassword(this.email);
            console.log(data);
        } catch (e) {
            console.log(e);
        }
    }

    async confirmForgot() {
        try {
            let data = await this.cognito.confirmForgotPassword(this.email, this.confirm, this.password);
            console.log(data);
        } catch (e) {
            console.log(e);
        }
    }
}
