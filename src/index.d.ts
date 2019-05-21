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

export declare class ErrorObject {
    code: string;
    message: string;
}

export declare class DetailAttributes {
    sub;
    email_verified;
    phone_number_verified;
    phone_number;
    given_name;
    family_name;
    nickname;
    email;
}

export declare class UserDetails {
    attributes: DetailAttributes;
    settings: any;
}

export declare class Cognito extends Common {
    // define your typings manually
    // or..
    // take the ios or android .d.ts files and copy/paste them here

    constructor(userPoolId, clientId, secret?, region?: Region);

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

export declare enum Region {
    UNKNOWN,
    US_GOV_EAST_1,
    US_EAST_1,
    US_EAST_2,
    US_WEST_1,
    US_WEST_2,
    EU_WEST_1,
    EU_WEST_2,
    EU_WEST_3,
    EU_CENTRAL_1,
    EU_NORTH_1,
    AP_SOUTH_1,
    AP_SOUTHEAST_1,
    AP_SOUTHEAST_2,
    AP_NORTHEAST_1,
    AP_NORTHEAST_2,
    SA_EAST_1,
    CA_CENTRAL_1,
    CN_NORTH_1,
    CN_NORTHWEST_1,
    DEFAULT_REGION,
}