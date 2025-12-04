namespace codeRules;

using {
    cuid,
    managed,
} from '@sap/cds/common';


@assert.unique: {objectTypeTemplate: [
    code,
    description
]}
entity ObjectType {
    key code        : String(6);
        description : String(33);
        active      : Boolean;

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
}

entity RuleType {
    key code        : String(30);
        description : String(100)
}

entity UserRule : managed {
    key ID            : UUID;
        baseRule      : Association to one BaseRule;

        @mandatory
        effectiveDate : Date;

        @mandatory
        endDate       : Date;
        user          : Association to one CodeUser;
}

entity CodeUser : managed {
    key ID      : String(36);
        rules   : Composition of many UserRule
                      on rules.user = $self;

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
    checkDate        : Date;
    baseRule         : Association to one BaseRule;
    objectName       : String(200);
    severity         : Int16;
    result           : String(10);
}
