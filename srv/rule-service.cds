using { codeRules } from '../db/schema';

service RuleService @(path: '/codeRuleService') {

    // Flat result: per rule per user, no timeframes, no assignments
    type SimpleRule {
        baserule_ID             : String;
        baserule_objectType     : String;
        baserule_ruletype       : String;
        baserule_value          : String;
        baseRule_severityRating : Int16;
        user_ID                 : String;
        user_trusted            : Boolean;
    }

    type Log {
        user             : String;
        transportRequest : String;
        subRequest       : String;
        checkDate        : DateTime;
        objectType       : String;
        ruleType         : String;
        value            : String;
        result           : String;
        objectName       : String;
        severity         : Int16;
    }


    @Capabilities.InsertRestrictions.Insertable: false
    @Capabilities.UpdateRestrictions.Updatable : false
    @Capabilities.DeleteRestrictions.Deletable : false
    entity RuleTypes as projection on codeRules.RuleType { * };

    @Capabilities.InsertRestrictions.Insertable: false
    @Capabilities.UpdateRestrictions.Updatable : false
    @Capabilities.DeleteRestrictions.Deletable : false
    entity ObjectTypes as projection on codeRules.ObjectType
        where manual = false;

    @Capabilities.InsertRestrictions.Insertable: false
    @Capabilities.UpdateRestrictions.Updatable : false
    @Capabilities.DeleteRestrictions.Deletable : false
    entity BaseRules as projection on codeRules.BaseRule {
        ID,
        @Common.Label: 'Object Type'
        objectType,
        @Common.Label: 'Value'
        value,
        severityRating,
        @Common.Label: 'Rule Description'
        ruleType.description as ruleType_description,
        @Common.Label: 'Rule Code'
        @(
            Common.ValueListWithFixedValues: true,
            Common.ValueList: {
                CollectionPath: 'RuleTypes',
                Parameters: [
                    {
                        $Type: 'Common.ValueListParameterInOut',
                        LocalDataProperty: 'ruleType_code',
                        ValueListProperty: 'code'
                    },
                    {
                        $Type: 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty: 'description'
                    }
                ]
            }
        ) ruleType : redirected to RuleTypes
    };

    @odata.draft.enabled
    @Common.Label: 'Code User'
    entity CodeUsers as projection on codeRules.CodeUser {
        @(
            Common.Label: 'User ID / Name',
            UI.Placeholder: 'Enter a new User ID/Name...'
        ) ID,
        modifiedAt,
        createdBy,
        createdAt,
        modifiedBy,
        trusted,

        @Common.Label: 'Untrusted Status'
        cast(
            case when trusted = true then false else true end
            as Boolean
        ) as untrusted
    }
    actions {

        @Core.OperationAvailable: IsActiveEntity
        @Common.SideEffects: {TargetProperties: ['in/trusted','in/untrusted']}
        action makeTrusted() returns CodeUsers;

        @Core.OperationAvailable: IsActiveEntity
        @Common.SideEffects: {TargetProperties: ['in/trusted','in/untrusted']}
        action makeUntrusted() returns CodeUsers;

        function applyAllRules() returns String;
    };


    @Capabilities.InsertRestrictions.Insertable: false
    @Capabilities.UpdateRestrictions.Updatable : false
    @Capabilities.DeleteRestrictions.Deletable : false
    entity AutomationLogs as projection on codeRules.AutomationLog;


    action  addLogs(logs: array of Log) returns String;

    function getApplicableRules(userId: String) returns array of SimpleRule;
    function getAllRules(userId: String) returns array of SimpleRule;

    function setTrustedUser(userId: String, trusted: Boolean) returns String;

}
