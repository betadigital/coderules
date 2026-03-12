namespace codeRules;

using {
    cuid,
    managed
} from '@sap/cds/common';

@assert.unique: {objectTypeTemplate: [
    code,
    programId
]}
entity ObjectType {
    key code        : String(5);
        description : String(75);
        programId   : String(5);
        active      : Boolean;
        excluded    : Boolean;
        manual      : Boolean;
}

@assert.unique: {ruleTemplate: [
    objectType,
    ruleType,
    value
]}
entity BaseRule : cuid, managed {
    @mandatory
    objectType      : Association to one ObjectType;

    @mandatory
    ruleType        : Association to one RuleType;

    value           : String(50);

    @mandatory
    severityRating  : Int16;

    codeQualityRule : Boolean default true;

    isActive        : Boolean default true;
}

entity RuleType {
    key code        : String(30);
        description : String(100);
        valueType   : String enum {
            string;
            integer;
            float;
            boolean;
            none;
        } default 'integer'
}

entity CodeUser : managed {
    key ID       : String(36);

        @mandatory
        trusted  : Boolean default false;
        isActive : Boolean default true;
}

@assert.unique: {AutomationLogEntry: [
    user,
    transportRequest,
    checkDate,
    baseRule
]}
entity AutomationLog : cuid {
    @mandatory
    user             : Association to one CodeUser;

    @mandatory
    transportRequest : String(20);
    subRequest       : String(20);

    @mandatory
    checkDate        : DateTime;
    baseRule         : Association to one BaseRule;

    @mandatory
    objectName       : String(200);
    severity         : Int16;

    @mandatory
    result           : String(10);
    codeQualityRule  : Boolean;
    message          : String;
    codeLine         : String;

}

entity TransportOutcome : cuid, managed {
    transportRequest : String(20);
    user             : Association to one CodeUser;
    failedChecks     : Boolean;

}
