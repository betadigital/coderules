using {codeRules} from '../db/schema';

service RuleService @(path: '/codeRuleService') {

    // Define the new, flat return type
    type SimpleRule {
        baserule_ID             : String;
        baserule_objectType     : String;
        baserule_ruletype       : String;
        baserule_value          : String;
        effectiveDate           : Date;
        endDate                 : Date;
        user_ID                 : String;
        baseRule_severityRating : Int16;
        user_trusted            : Boolean;
    }


    @Capabilities.InsertRestrictions.Insertable: false
    @Capabilities.UpdateRestrictions.Updatable : false
    @Capabilities.DeleteRestrictions.Deletable : false
    entity RuleTypes      as
        projection on codeRules.RuleType {
            *
        };

    @Capabilities.InsertRestrictions.Insertable: false
    @Capabilities.UpdateRestrictions.Updatable : false
    @Capabilities.DeleteRestrictions.Deletable : false
    entity ObjectTypes    as projection on codeRules.ObjectType where manual = false;

    @Capabilities.InsertRestrictions.Insertable: false
    @Capabilities.UpdateRestrictions.Updatable : false
    @Capabilities.DeleteRestrictions.Deletable : false
    entity BaseRules      as
        projection on codeRules.BaseRule {
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
                Common.ValueList               : {
                    CollectionPath: 'RuleTypes',
                    Parameters    : [
                        {
                            // This parameter maps the key for saving
                            $Type            : 'Common.ValueListParameterInOut',
                            LocalDataProperty: 'ruleType_code',
                            // The FK field on BaseRule
                            ValueListProperty: 'code' // The key on RuleType
                        },
                        {
                            // This parameter tells the dropdown what to *show*
                            $Type            : 'Common.ValueListParameterDisplayOnly',
                            ValueListProperty: 'description'
                        }
                    ]
                }
            ) ruleType : redirected to RuleTypes

        };

            @odata.draft.enabled
            @Common.Label           : 'Code User'
    entity CodeUsers      as
        projection on codeRules.CodeUser {
            @(
                Common.Label  : 'User ID / Name',
                UI.Placeholder: 'Enter a new User ID/Name...'
            )
            ID,
            modifiedAt,
            createdBy,
            createdAt,
            modifiedBy,
            rules,
            trusted,
            @Common.Label: 'Untrusted Status'
            cast(
                case
                    when trusted = true
                         then false
                    else true
                end as Boolean
            ) as untrusted
        }
        actions {
            // Only allow these actions when the entity is Active (Saved), not in Draft (Edit) mode.
            @Core.OperationAvailable: IsActiveEntity
            @Common.SideEffects     : {TargetProperties: [
                'in/trusted',
                'in/untrusted'
            ]}
            action makeTrusted()   returns CodeUsers;

            @Core.OperationAvailable: IsActiveEntity
            @Common.SideEffects     : {TargetProperties: [
                'in/trusted',
                'in/untrusted'
            ]}
            action makeUntrusted() returns CodeUsers;
        };

    @Capabilities.InsertRestrictions.Insertable: false
    @Capabilities.UpdateRestrictions.Updatable : false
    @Capabilities.DeleteRestrictions.Deletable : false
    entity AutomationLogs as projection on codeRules.AutomationLog;


    // UserRules — child of CodeUser, draft handled by parent
    entity UserRules      as
        projection on codeRules.UserRule {
            ID,
            user,

            effectiveDate,
            endDate,

            @(Common.ValueList: {
                CollectionPath: 'BaseRules',
                Parameters    : [
                    {
                        // This maps the key for saving
                        $Type            : 'Common.ValueListParameterInOut',
                        LocalDataProperty: 'baseRule_ID',
                        ValueListProperty: 'ID'
                    },
                    {
                        // First display column: Object type code
                        $Type            : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty: 'objectType_code'
                    },
                    {
                        // display column: Rule Code
                        $Type            : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty: 'ruleType_code'
                    },
                    {
                        // display column: Rule Description
                        $Type            : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty: 'ruleType_description'
                    },
                    {
                        //  display column: Value
                        $Type            : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty: 'value'
                    }
                ]
            })
            baseRule,
            modifiedAt,
            modifiedBy,
            createdAt,
            createdBy

        };

    action   addLog(user: String,
                    transportRequest: String,
                    subRequest: String,
                    checkDate: Date,
                    objectType: String,
                    ruleType: String,
                    value: String,
                    result: String,
                    objectName: String,
                    severity: Int16, )                        returns String;

    function getApplicableRules(userId: String)               returns array of SimpleRule;

    function getAllRules(userId: String)                      returns array of SimpleRule;

    function setTrustedUser(userId: String, trusted: Boolean) returns String;

    action   checkForOverdueRules(userId: String)             returns String;


}
