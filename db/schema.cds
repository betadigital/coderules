namespace codeRules;

using {
    cuid,
    managed
} from '@sap/cds/common';


@assert.unique: {ruleTemplate: [
    objectType,
    ruleType,
    value
]}
entity BaseRule : cuid, managed {
    @mandatory
    objectType : String(10);

    @mandatory
    ruleType   : Association to one RuleType;

    @mandatory
    value      : String(50);
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
        trusted : Boolean;
}

entity AutomationLog : cuid {
    user             : Association to one CodeUser;
    transportRequest : String(20);
    checkDate        : Date;
    baseRule         : Association to one BaseRule;
    result           : String(10);
}
