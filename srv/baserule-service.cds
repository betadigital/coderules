using {codeRules} from '../db/schema';

service BaseRuleService @(path: '/baseRuleService') {


    entity RuleTypes   as
        projection on codeRules.RuleType {
            code,
            @readonly
            description
        };


    @Capabilities.InsertRestrictions.Insertable: false
    @Capabilities.DeleteRestrictions.Deletable : false
    entity ObjectTypes as
        projection on codeRules.ObjectType {
            *
        }where manual = false;


    @odata.draft.enabled
    entity BaseRules   as
        projection on codeRules.BaseRule {
            ID,
            value,
            createdAt,
            createdBy  as Author,
            modifiedAt,
            modifiedBy as EditedBy,
            @(
                Common.ValueListWithFixedValues: true,
                Common.ValueList               : {
                    CollectionPath: 'ObjectTypes',
                    Parameters    : [
                        {
                            $Type            : 'Common.ValueListParameterInOut',
                            LocalDataProperty: 'objectType_code',
                            ValueListProperty: 'code'
                        },
                        {
                            $Type            : 'Common.ValueListParameterDisplayOnly',
                            ValueListProperty: 'description'
                        }

                    ]
                }
            ) objectType : redirected to ObjectTypes,

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
            ruleType,
            severityRating
        };

    action fileUploadBaseRules(rules: LargeString) returns String;

}
