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
        manual      : Boolean;
}

@assert.unique: {ruleTemplate: [
    objectType,
    ruleType,
    value
]}
entity BaseRule : cuid, managed {
    @mandatory
    objectType     : Association to one ObjectType;

    @mandatory
    ruleType       : Association to one RuleType;

    @mandatory
    value          : String(50);

    @mandatory
    severityRating : Int16;

    codeQualityRule: Boolean default true;
}

entity RuleType {
    key code        : String(30);
        description : String(100);
        valueType   : String enum {
            string;
            integer;
            float;
            boolean;
        } default 'integer'
}

entity CodeUser : managed {
    key ID      : String(36);

    @mandatory
    trusted : Boolean default false;
}

@assert.unique: {AutomationLogEntry: [
    user,
    transportRequest,
    checkDate,
    baseRule
]}
entity AutomationLog : cuid {
    user             : Association to one CodeUser;
    transportRequest : String(20);
    subRequest       : String(20);
    checkDate        : DateTime;
    baseRule         : Association to one BaseRule;
    objectName       : String(200);
    severity         : Int16;
    result           : String(10);
}
