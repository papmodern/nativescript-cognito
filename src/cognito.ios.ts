import { Common } from './cognito.common';
import { UserSession, ErrorObject } from "./index";

declare const AWSServiceConfiguration, AWSCognitoIdentityUserPoolConfiguration, AWSCognitoIdentityUserPool,
    AWSRegionUSEast1, AWSCognitoIdentityUserAttributeType;

const main_queue = dispatch_get_current_queue();

export class Cognito extends Common {
    userPool = null;

    constructor(userPoolId, clientId, secret?) {
        super();

        const serviceConf = new AWSServiceConfiguration(
            AWSRegionUSEast1,
            null
        );

        const conf = new AWSCognitoIdentityUserPoolConfiguration(
            clientId, secret, userPoolId
        );
        AWSCognitoIdentityUserPool
            .registerCognitoIdentityUserPoolWithConfigurationUserPoolConfigurationForKey(serviceConf, conf, "UserPool");
        this.userPool = AWSCognitoIdentityUserPool.CognitoIdentityUserPoolForKey("UserPool");
    }

    public getCurrentUser() {
        return this.userPool.currentUser();
    }

    private attributesFactory(attributes) {
        const userAttrs = [];
        Object.keys(attributes).forEach(key => {
            const attr = new AWSCognitoIdentityUserAttributeType();
            attr.name = key;
            attr.value = attributes[key];
            userAttrs.push(attr);
        });

        return userAttrs;
    }

    public signUp(userId, password, attributes) {

        return new Promise((resolve, reject) => {
            // @ts-ignore
            const callBack = t => {
                dispatch_async(main_queue, () => {
                    if (t.error) reject(Cognito.getErrorObject(t.error));
                    else {
                        const { cognitoUser, userConfirmed, codeDeliveryDetails } = t.result;
                        resolve({ cognitoUser, userConfirmed, codeDeliveryDetails });
                    }
                });
                return null;
            };

            this.userPool
                .signUpPasswordUserAttributesValidationData(userId, password, this.attributesFactory(attributes), null)
                .continueWithBlock(callBack);
        });
    }

    public confirmRegistration(userId, confirmationCode, forcedAliasCreation = false) {
        const cognitoUser = this.userPool.getUser(userId);
        return new Promise((resolve, reject) => {
            // @ts-ignore
            const callBack = t => {
                dispatch_async(main_queue, () => {
                    if (t.error) reject(Cognito.getErrorObject(t.error));
                    else {
                        resolve(cognitoUser.username);
                    }
                });
                return null;
            };

            cognitoUser
                .confirmSignUp(confirmationCode)
                .continueWithBlock(callBack);
        });
    }

    public resendCode(userId) {
        const cognitoUser = this.userPool.getUser(userId);
        return new Promise((resolve, reject) => {

            const callBack = t => {
                dispatch_async(main_queue, () => {
                    if (t.error) reject(Cognito.getErrorObject(t.error));
                    else {
                        resolve(cognitoUser.username);
                    }
                });
                return null;
            };

            cognitoUser
                .resendConfirmationCode()
                .continueWithBlock(callBack);
        });
    }

    public authenticate(userId, password) {
        const cognitoUser = this.userPool.getUser(userId);

        return new Promise((resolve, reject) => {
            // @ts-ignore
            const callBack = t => {
                dispatch_async(main_queue, () => {
                    if (t.error) reject(Cognito.getErrorObject(t.error));
                    else {
                        const session = t.result;
                        const data = Cognito.getSessionObject(session);
                        resolve(data);
                    }
                });
                return null;
            };

            cognitoUser
                .getSessionPasswordValidationData(userId, password, null)
                .continueWithBlock(callBack);
        });
    }

    public forgotPassword(userId) {
        const cognitoUser = this.userPool.getUser(userId);
        return new Promise((resolve, reject) => {

            const callBack = t => {
                dispatch_async(main_queue, () => {
                    if (t.error) reject(Cognito.getErrorObject(t.error));
                    else {
                        resolve(cognitoUser.username);
                    }
                });
                return null;
            };

            cognitoUser
                .forgotPassword()
                .continueWithBlock(callBack);
        });
    }

    public confirmForgotPassword(userId: string, code: string, newPassword: string) {
        const cognitoUser = this.userPool.getUser(userId);
        return new Promise((resolve, reject) => {

            const callBack = t => {
                dispatch_async(main_queue, () => {
                    if (t.error) reject(Cognito.getErrorObject(t.error));
                    else {
                        resolve(cognitoUser.username);
                    }
                });
                return null;
            };

            cognitoUser
                .confirmForgotPasswordPassword(code, newPassword)
                .continueWithBlock(callBack);
        });
    }

    public changePassword(userId, oldPassword, newPassword) {
        const cognitoUser = this.userPool.getUser(userId);
        return new Promise((resolve, reject) => {
            const callBack = t => {
                dispatch_async(main_queue, () => {
                    if (t.error) reject(Cognito.getErrorObject(t.error));
                    else {
                        resolve(cognitoUser.username);
                    }
                });
                return null;
            };

            cognitoUser
                .changePasswordProposedPassword(oldPassword, newPassword)
                .continueWithBlock(callBack);
        });
    }

    public getCurrentUserSession() {
        return new Promise((resolve, reject) => {
            const callBack = t => {
                dispatch_async(main_queue, () => {
                    if (t.error) reject(Cognito.getErrorObject(t.error));
                    else {
                        const data = Cognito.getSessionObject(t.result);
                        resolve(data);
                    }
                });
                return null;
            };

            this.getCurrentUser()
                .getSession()
                .continueWithBlock(callBack);
        });
    }

    public deleteUser(userId) {
        const cognitoUser = this.userPool.getUser(userId);
        return new Promise((resolve, reject) => {
            const callBack = t => {
                dispatch_async(main_queue, () => {
                    if (t.error) reject(Cognito.getErrorObject(t.error));
                    else {
                        resolve(cognitoUser.username);
                    }
                });
                return null;
            };

            cognitoUser
                .deleteUser()
                .continueWithBlock(callBack);
        });
    }

    public getUserDetails() {
        return new Promise((resolve, reject) => {
            const callBack = t => {
                dispatch_async(main_queue, () => {
                    if (t.error) reject(Cognito.getErrorObject(t.error));
                    else {
                        const data = {};
                        const attrs = t.result.userAttributes;
                        for (let i = 0; i < attrs.count; i++)
                            data[attrs[i].name] = attrs[i].value;
                        resolve({
                            attributes: data,
                            settings: t.result.userMFASettingList
                        });
                    }
                });
                return null;
            };

            this.getCurrentUser()
                .getDetails()
                .continueWithBlock(callBack);
        });
    }

    public logout() {
        this.getCurrentUser().signOut();
    }

    private static getSessionObject = (session): UserSession => (
        {
            accessToken: {
                token: session.accessToken.tokenString,
                username: session.username,
                expiration: session.expirationTime
            },
            refreshToken: {
                token: session.refreshToken.tokenString
            },
            idToken: {
                token: session.idToken.tokenString,
                expiration: session.expirationTime,
                // issuedAt: session.getIdToken().getIssuedAt(),
            },
            isValidForThreshold: session.isValidForThreshold,
            username: session.username,
            isValid: session.isValid,
        } as UserSession
    );

    private static getErrorObject = (error): ErrorObject => (
        {
            code: error.userInfo.objectForKey("__type"),
            message: error.userInfo.objectForKey("message")
        } as ErrorObject 
    );

}