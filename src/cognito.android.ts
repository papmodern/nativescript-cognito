import { Common } from './cognito.common';
import * as app from 'tns-core-modules/application';
import { AccessToken, ErrorObject, IdToken, RefreshToken, UserDetails, UserSession } from "./index";

declare const com: { amazonaws };

const CognitoUserPool = com.amazonaws.mobileconnectors.cognitoidentityprovider.CognitoUserPool,
    CognitoUserAttributes = com.amazonaws.mobileconnectors.cognitoidentityprovider.CognitoUserAttributes,
    SignUpHandler = com.amazonaws.mobileconnectors.cognitoidentityprovider.handlers.SignUpHandler,
    GenericHandler = com.amazonaws.mobileconnectors.cognitoidentityprovider.handlers.GenericHandler,
    AuthenticationDetails = com.amazonaws.mobileconnectors.cognitoidentityprovider.continuations.AuthenticationDetails,
    AuthenticationHandler = com.amazonaws.mobileconnectors.cognitoidentityprovider.handlers.AuthenticationHandler,
    GetDetailsHandler = com.amazonaws.mobileconnectors.cognitoidentityprovider.handlers.GetDetailsHandler,
    ForgotPasswordHandler = com.amazonaws.mobileconnectors.cognitoidentityprovider.handlers.ForgotPasswordHandler,
    VerificationHandler = com.amazonaws.mobileconnectors.cognitoidentityprovider.handlers.VerificationHandler,
    Regions = com.amazonaws.regions.Regions;


export class Cognito extends Common {
    userPool = null;
    session: UserSession = null;
    forgotContinue = null;
    forgotSuccess = () => null;
    forgotFailure = e => null;

    constructor(userPoolId, clientId, secret?, region?: Region) {
        super();
        this.userPool = new CognitoUserPool(
            app.android.context, userPoolId, clientId, secret, Regions[region]
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
                    resolve({ cognitoUser, userConfirmed, codeDeliveryDetails });
                },
                onFailure(exception) {
                    reject(Cognito.getErrorObject(exception));
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
                    resolve(userId);
                },
                onFailure(exception) {
                    reject(Cognito.getErrorObject(exception));
                }
            });

            cognitoUser.confirmSignUpInBackground(confirmationCode, forcedAliasCreation, callBack);
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
                    reject(Cognito.getErrorObject(exception));
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
                    const data = Cognito.getSessionObject(session);
                    this.session = data;
                    resolve(data);
                },
                onFailure(exception) {
                    reject(Cognito.getErrorObject(exception));
                }
            });

            cognitoUser.getSessionInBackground(callBack);
        });
    }

    public forgotPassword(userId) {
        const cognitoUser = this.userPool.getUser(userId);
        let that = this
        return new Promise((resolve, reject) => {
            const callBack = new ForgotPasswordHandler({
                onSuccess() {
                    // resolve(cognitoUser.username);
                    that.forgotSuccess()
                },
                getResetCode(continuation) {
                    that.forgotContinue = continuation;
                    resolve(cognitoUser.username);
                },
                onFailure(exception) {
                    reject(Cognito.getErrorObject(exception));
                    that.forgotFailure(exception)
                }
            });

            cognitoUser.forgotPasswordInBackground(callBack);
        });
    }

    public confirmForgotPassword(userId, code, newPassword) {
        if (this.forgotContinue == null) return 0;
        // Set the new password
        this.forgotContinue.setPassword(newPassword);

        // Set the code to verify
        this.forgotContinue.setVerificationCode(code);

        // Let the forgot password process proceed
        this.forgotContinue.continueTask();

        return new Promise((resolve, reject) => {
            this.forgotSuccess = () => resolve(userId);
            this.forgotFailure = e => reject(Cognito.getErrorObject(e));
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
                    reject(Cognito.getErrorObject(exception));
                }
            });

            cognitoUser.changePasswordInBackground(oldPassword, newPassword, callBack);
        });
    }

    public getCurrentUserSession() {
        return new Promise((resolve, reject) => {
            const callBack = new AuthenticationHandler({
                // getMFACode(continuation) {
                //     const code = continuation.getParameter()[0];
                //     continuation.setMfaCode(code);
                //     continuation.continueTask();
                // },
                // authenticationChallenge(continuation) {
                // },
                // getAuthenticationDetails(continuation, userID) {
                //     const authDetails = new AuthenticationDetails(userId, password, null);
                //
                //     continuation.setAuthenticationDetails(authDetails);
                //     continuation.continueTask();
                // },
                onSuccess(session, newDevice) {
                    const data = Cognito.getSessionObject(session);
                    this.session = data;
                    resolve(data);
                },
                onFailure(exception) {
                    reject(Cognito.getErrorObject(exception));
                }
            });
            this.getCurrentUser().getSession(callBack);
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
                    reject(Cognito.getErrorObject(exception));
                }
            });

            cognitoUser.deleteUserInBackground(callBack);
        });
    }

    public getUserDetails() {
        return new Promise((resolve, reject) => {
            const callBack = new GetDetailsHandler({
                onSuccess(details) {

                    const detailsObj = {};
                    const iterator = details.getAttributes().getAttributes().keySet().iterator();
                    while (iterator.hasNext()) {
                        const key = iterator.next();
                        detailsObj[key] = details.getAttributes().getAttributes().get(key);
                    }
                    resolve({
                        attributes: detailsObj,
                        settings: details.getSettings().getSettings()
                    } as UserDetails);
                },
                onFailure(exception) {
                    reject(Cognito.getErrorObject(exception));
                }
            });

            this.getCurrentUser().getDetailsInBackground(callBack);
        });
    }

    public logout() {
        this.getCurrentUser().signOut();
        this.session = null;
    }

    private static getSessionObject = (session): UserSession => (
        {
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
        } as UserSession
    );

    private static getErrorObject = (error): ErrorObject => (
        {

            code: "0",
            message: error.getMessage()
        } as ErrorObject
    );
}

export enum Region {
    UNKNOWN = 'Unknown',
    US_GOV_EAST_1 = 'US_GOV_EAST_1',
    US_EAST_1 = 'US_EAST_1',
    US_EAST_2 = 'US_EAST_2',
    US_WEST_1 = 'US_WEST_1',
    US_WEST_2 = 'US_WEST_2',
    EU_WEST_1 = 'EU_WEST_1',
    EU_WEST_2 = 'EU_WEST_2',
    EU_WEST_3 = 'EU_WEST_3',
    EU_CENTRAL_1 = 'EU_CENTRAL_1',
    EU_NORTH_1 = 'EU_NORTH_1',
    AP_SOUTH_1 = 'AP_SOUTH_1',
    AP_SOUTHEAST_1 = 'AP_SOUTHEAST_1',
    AP_SOUTHEAST_2 = 'AP_SOUTHEAST_2',
    AP_NORTHEAST_1 = 'AP_NORTHEAST_1',
    AP_NORTHEAST_2 = 'AP_NORTHEAST_2',
    SA_EAST_1 = 'SA_EAST_1',
    CA_CENTRAL_1 = 'CA_CENTRAL_1',
    CN_NORTH_1 = 'CN_NORTH_1',
    CN_NORTHWEST_1 = 'CN_NORTHWEST_1',
    DEFAULT_REGION = 'DEFAULT_REGION',
}