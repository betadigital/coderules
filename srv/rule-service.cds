using {codeRules} from '../db/schema';

service RuleService @(path: '/codeRuleService') {

    // Define the new, flat return type
    type SimpleRule {
        baserule_ID         : String;
        baserule_objectType : String;
        baserule_ruletype   : String; // This will hold the RuleType.code
        baserule_value      : String;
        effectiveDate       : Date;
        endDate             : Date;
    }


    @Capabilities.InsertRestrictions.Insertable: false
    @Capabilities.UpdateRestrictions.Updatable : false
    @Capabilities.DeleteRestrictions.Deletable : false
    entity RuleTypes as
        projection on codeRules.RuleType {
            *
        };

    @Capabilities.InsertRestrictions.Insertable: false
    @Capabilities.UpdateRestrictions.Updatable : false
    @Capabilities.DeleteRestrictions.Deletable : false
    entity BaseRules as
        projection on codeRules.BaseRule {
            ID,
            objectType,
            value,
            ruleType.description as ruleType_description,
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
    @Common.Label: 'Code User'
    entity CodeUsers as
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
            rules
        };


    // UserRules — child of CodeUser, draft handled by parent
    entity UserRules as
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
                        // First display column
                        $Type            : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty: 'ruleType_description'
                    },
                    {
                        // Second display column
                        $Type            : 'Common.Value_ListParameterDisplayOnly',
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

    function getApplicableRules(userId: String)   returns array of SimpleRule;

    function getAllRules(userId: String)          returns array of SimpleRule;

    action   checkForOverdueRules(userId: String) returns String;


}
