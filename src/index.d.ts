import {Common} from './cognito.common';

export declare class AccessToken {
    expiration: Date;
    token: string;
    username: string;
}

export declare class IdToken {
    expiration: Date;
    issuedAt: Date;
    token: string;
}

export declare class RefreshToken {
    token: string;
}

export declare class UserSession {
    accessToken: AccessToken;
    idToken: IdToken;
    refreshToken: RefreshToken;
    username: string;
    isValid: boolean;
    isValidForThreshold: boolean;
}

export declare class UserDetails {
    attributes: [{ key, value }];
    settings: [{ key, value }];
}

export declare class Cognito extends Common {
    // define your typings manually
    // or..
    // take the ios or android .d.ts files and copy/paste them here

    constructor(userPoolId, clientId, secret?);

    // TODO: Create AWSIdentityUser class definitions
    public getCurrentUser(): any;

    // TODO: Create SignUpResult class definitions
    public signUp(userId, password, attributes): Promise<{ cognitoUser, userConfirmed, codeDeliveryDetails }>;

    public confirmRegistration(userId, confirmationCode, forcedAliasCreation?): Promise<string>;

    public resendCode(userId): Promise<string>;

    public authenticate(userId, password): Promise<UserSession>;

    public forgotPassword(userId): Promise<string>;

    public confirmForgotPassword(userId: string, code: string, newPassword: string): Promise<string>;

    public changePassword(userId, oldPassword, newPassword): Promise<string>;

    public getCurrentUserSession(): Promise<UserSession>;

    public deleteUser(userId): Promise<string>;

    public getUserDetails(): Promise<UserDetails>;

    public logout(): void;
}
