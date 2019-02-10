import {Common} from './cognito.common';
import * as app from 'tns-core-modules/application';
import {AccessToken, IdToken, RefreshToken, UserDetails, UserSession} from "./index";

declare const com: { amazonaws };

const CognitoUserPool = com.amazonaws.mobileconnectors.cognitoidentityprovider.CognitoUserPool,
    CognitoUserAttributes = com.amazonaws.mobileconnectors.cognitoidentityprovider.CognitoUserAttributes,
    SignUpHandler = com.amazonaws.mobileconnectors.cognitoidentityprovider.handlers.SignUpHandler,
    GenericHandler = com.amazonaws.mobileconnectors.cognitoidentityprovider.handlers.GenericHandler,
    AuthenticationDetails = com.amazonaws.mobileconnectors.cognitoidentityprovider.continuations.AuthenticationDetails,
    AuthenticationHandler = com.amazonaws.mobileconnectors.cognitoidentityprovider.handlers.AuthenticationHandler,
    GetDetailsHandler = com.amazonaws.mobileconnectors.cognitoidentityprovider.handlers.GetDetailsHandler,
    ForgotPasswordHandler = com.amazonaws.mobileconnectors.cognitoidentityprovider.handlers.ForgotPasswordHandler,
    VerificationHandler = com.amazonaws.mobileconnectors.cognitoidentityprovider.handlers.VerificationHandler;


export class Cognito extends Common {
    userPool = null;
    session: UserSession = null;

    constructor(userPoolId, clientId, secret?) {
        super();
        this.userPool = new CognitoUserPool(
            app.android.context, userPoolId, clientId, secret
        );
    }

    public getCurrentUser() {
        return this.userPool.getCurrentUser();
    }

    private attributesFactory(attributes) {
        const userAttrs = new CognitoUserAttributes();
        Object.keys(attributes).forEach(key => {
            userAttrs.addAttribute(key, attributes[key]);
        });

        return userAttrs;
    }

    public signUp(userId, password, attributes) {

        return new Promise((resolve, reject) => {
            const callBack = new SignUpHandler({
                onSuccess(cognitoUser, userConfirmed, codeDeliveryDetails) {
                    resolve({cognitoUser, userConfirmed, codeDeliveryDetails});
                },
                onFailure(exception) {
                    reject(exception);
                }
            });

            this.userPool.signUpInBackground(userId, password, this.attributesFactory(attributes), null, callBack);
        });
    }

    public confirmRegistration(userId, confirmationCode, forcedAliasCreation = false) {
        const cognitoUser = this.userPool.getUser(userId);
        return new Promise((resolve, reject) => {
            const callBack = new GenericHandler({
                onSuccess() {
                    resolve(cognitoUser.username);
                },
                onFailure(exception) {
                    reject(exception);
                }
            });

            this.userPool.confirmSignUpInBackground(confirmationCode, forcedAliasCreation, callBack);
        });
    }

    public resendCode(userId) {
        const cognitoUser = this.userPool.getUser(userId);
        return new Promise((resolve, reject) => {
            const callBack = new VerificationHandler({
                onSuccess() {
                    resolve(cognitoUser.username);
                },
                onFailure(exception) {
                    reject(exception);
                }
            });

            cognitoUser.resendConfirmationCodeInBackground(callBack);
        });
    }

    public authenticate(userId, password) {
        const cognitoUser = this.userPool.getUser(userId);
        const authData = new AuthenticationDetails(
            userId, password, null
        );

        return new Promise((resolve, reject) => {
            const callBack = new AuthenticationHandler({
                getMFACode(continuation) {
                    const code = continuation.getParameter()[0];
                    continuation.setMfaCode(code);
                    continuation.continueTask();
                },
                authenticationChallenge(continuation) {
                },
                getAuthenticationDetails(continuation, userID) {
                    const authDetails = new AuthenticationDetails(userId, password, null);

                    continuation.setAuthenticationDetails(authDetails);
                    continuation.continueTask();
                },
                onSuccess(session, newDevice) {
                    const data = {
                        accessToken: {
                            token: session.getAccessToken().getJWTToken(),
                            username: session.getAccessToken().getUsername(),
                            expiration: session.getAccessToken().getExpiration()
                        },
                        refreshToken: {
                            token: session.getRefreshToken().getToken()
                        },
                        idToken: {
                            expiration: session.getIdToken().getExpiration(),
                            issuedAt: session.getIdToken().getIssuedAt(),
                            token: session.getIdToken().getJWTToken(),
                        },
                        isValidForThreshold: session.isValidForThreshold,
                        username: session.getUsername(),
                        isValid: session.isValid,
                    }as UserSession;
                    this.session = data;
                    resolve(data);
                },
                onFailure(exception) {
                    reject(exception);
                }
            });

            cognitoUser.getSessionInBackground(callBack);
        });
    }

    public forgotPassword(userId) {
        const cognitoUser = this.userPool.getUser(userId);
        return new Promise((resolve, reject) => {
            const callBack = new ForgotPasswordHandler({
                onSuccess() {
                    resolve(cognitoUser.username);
                },
                // getResetCode(continuation) {
                //
                // },
                onFailure(exception) {
                    reject(exception);
                }
            });

            cognitoUser.forgotPasswordInBackground(callBack);
        });
    }

    public confirmForgotPassword(userId, code, newPassword) {
        const cognitoUser = this.userPool.getUser(userId);
        return new Promise((resolve, reject) => {
            const callBack = new ForgotPasswordHandler({
                onSuccess() {
                    resolve(cognitoUser.username);
                },
                // getResetCode(continuation) {
                //
                // },
                onFailure(exception) {
                    reject(exception);
                }
            });

            cognitoUser.confirmPasswordInBackground(code, newPassword, callBack);
        });
    }

    public changePassword(userId, oldPassword, newPassword) {
        const cognitoUser = this.userPool.getUser(userId);
        return new Promise((resolve, reject) => {
            const callBack = new GenericHandler({
                onSuccess() {
                    resolve(cognitoUser.username);
                },
                onFailure(exception) {
                    reject(exception);
                }
            });

            cognitoUser.changePasswordInBackground(oldPassword, newPassword, callBack);
        });
    }

    public getCurrentUserSession() {
        return new Promise((resolve, reject) => {
            if (this.session)
                resolve(this.session);
            else
                reject("no session available");
        });
    }

    public deleteUser(userId) {
        const cognitoUser = this.userPool.getUser(userId);
        return new Promise((resolve, reject) => {
            const callBack = new GenericHandler({
                onSuccess() {
                    resolve(cognitoUser.username);
                },
                onFailure(exception) {
                    reject(exception);
                }
            });

            cognitoUser.deleteUserInBackground(callBack);
        });
    }

    public getUserDetails() {
        return new Promise((resolve, reject) => {
            const callBack = new GetDetailsHandler({
                onSuccess(details) {
                    resolve({
                        attributes: details.getAttributes().getAttributes(),
                        settings: details.getSettings().getSettings()
                    }as UserDetails);
                },
                onFailure(exception) {
                    reject(exception);
                }
            });

            this.getCurrentUser().getDetailsInBackground(callBack);
        });
    }

    public logout() {
        this.getCurrentUser().signOut();
        this.session = null;
    }
}
