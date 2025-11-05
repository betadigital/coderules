using {codeRules} from '../db/schema';

service BaseRuleService @(path: '/baseRuleService') {


    entity RuleTypes           as
        projection on codeRules.RuleType {
            code,
            @readonly
            description
        };


    @Common.Label: 'Object Type'
    entity DistinctObjectTypes as
        select from codeRules.BaseRule {
                @Common.Label: 'Object Type'
            key objectType
        }
        group by
            objectType;


    @odata.draft.enabled
    entity BaseRules           as
        projection on codeRules.BaseRule {
            ID,
            @(Common.ValueList: {
                CollectionPath: 'DistinctObjectTypes',
                Parameters    : [{
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: 'objectType',
                    // The field we are editing
                    ValueListProperty: 'objectType' // The field from the suggestion list
                }]
            })
            objectType,
            value,
            createdAt,
            createdBy  as Author,
            modifiedAt,
            modifiedBy as EditedBy,

            @(
                Common.ValueListWithFixedValues: true,
                Common.ValueList               : {
                    CollectionPath: 'RuleTypes',
                    Parameters    : [
                        {
                            $Type            : 'Common.ValueListParameterInOut',
                            LocalDataProperty: 'ruleType_code',
                            ValueListProperty: 'code'
                        },
                        {
                            // This parameter tells the dropdown what to *show*
                            $Type            : 'Common.ValueListParameterDisplayOnly',
                            ValueListProperty: 'description'
                        }
                    ]
                }
            )
            ruleType
        };

    action fileUploadBaseRules(rules: LargeString) returns String;

}
