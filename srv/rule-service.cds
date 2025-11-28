using {codeRules} from '../db/schema';

service RuleService @(path: '/codeRuleService') {

    // Define the new, flat return type
    type SimpleRule {
        baserule_ID             : String;
        baserule_objectType     : String;
        baserule_ruletype       : String; // This will hold the RuleType.code
        baserule_value          : String;
        effectiveDate           : Date;
        endDate                 : Date;
        user_ID                 : String;
        baseRule_severityRating : Int16;
        user_isTrusted          : Boolean;
    }

    @Capabilities.InsertRestrictions.Insertable: false
    @Capabilities.UpdateRestrictions.Updatable : false
    @Capabilities.DeleteRestrictions.Deletable : false
    entity RuleTypes      as
        projection on codeRules.RuleType {
            // --- LABELS & DROPDOWN FORMATTING ---
            // 1. Add Labels here to show in the column headers
            @Common.Label          : 'Rule Code'
            // 2. Use Common.Text to format the dropdown as "Description (Code)"
            @Common.Text           : description
            @Common.TextArrangement: #TextLast
            code,

            @Common.Label          : 'Description'
            @readonly
            description
        };

    @Capabilities.InsertRestrictions.Insertable: false
    @Capabilities.UpdateRestrictions.Updatable : false
    @Capabilities.DeleteRestrictions.Deletable : false
    entity ObjectTypes    as projection on codeRules.ObjectType;

    @Capabilities.InsertRestrictions.Insertable: false
    @Capabilities.UpdateRestrictions.Updatable : false
    @Capabilities.DeleteRestrictions.Deletable : false
    entity BaseRules      as
        projection on codeRules.BaseRule {
            ID,

            @(
                Common.ValueListWithFixedValues: true,
                Common.ValueList               : {
                    CollectionPath: 'ObjectTypes',
                    Parameters    : [{
                        $Type            : 'Common.ValueListParameterInOut',
                        LocalDataProperty: 'objectType',
                        // Point to Association
                        ValueListProperty: 'code'
                    }]
                }
            )
            objectType : redirected to ObjectTypes,

            @Common.Label: 'Value'
            value,
            severityRating,

            // --- EXPLICIT DISPLAY FIELDS FOR VALUE LIST ---
            // We must explicitly project these fields to attach Labels to them.
            // Shadow columns (like ruleType_code) do not have labels.

            @Common.Label: 'Rule Description'
            ruleType.description as ruleType_description,

            @Common.Label: 'Rule Code'
            ruleType.code        as ruleCode,


            @Common.Label: 'Rule Code'
            @(
                Common.ValueListWithFixedValues: true,
                Common.ValueList               : {
                    CollectionPath: 'RuleTypes',
                    Parameters    : [
                        {
                            $Type            : 'Common.ValueListParameterInOut',
                            LocalDataProperty: 'ruleType',
                            // Point to Association
                            ValueListProperty: 'code'
                        },
                        {
                            $Type            : 'Common.ValueListParameterDisplayOnly',
                            ValueListProperty: 'description'
                        }
                    ]
                }
            )
            ruleType   : redirected to RuleTypes

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

            // --- Calculated field for untrusted status (HANA Compatible) ---
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
                        LocalDataProperty: 'baseRule',
                        // Point to Association
                        ValueListProperty: 'ID'
                    },
                    {
                        // First display column: Rule Code
                        $Type            : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty: 'ruleCode' // Point to the explicit field with the label
                    },
                    {
                        // Second display column: Rule Description
                        $Type            : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty: 'ruleType_description'
                    },
                    {
                        // Third display column: Value
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
