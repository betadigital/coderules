using BaseRuleService as service from '../../srv/baserule-service';
annotate service.BaseRules with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : ID,
            Label : 'ID',
        },
        {
            $Type : 'UI.DataField',
            Value : ruleType.description,
            Label : '{i18n>RuleDescription}',
        },
        {
            $Type : 'UI.DataField',
            Value : objectType,
            Label : 'Object Type',
        },
        {
            $Type : 'UI.DataField',
            Value : ruleType_code,
            Label : '{i18n>RuleType}',
        },
        {
            $Type : 'UI.DataField',
            Value : Author,
            Label : 'Author',
        },
        {
            $Type : 'UI.DataField',
            Value : createdAt,
        },
    ],
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Rule Details',
            ID : 'RuleDetails',
            Target : '@UI.FieldGroup#RuleDetails',
        },
    ],
    UI.FieldGroup #RuleDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : ruleType_code,
                Label : 'Rule Code',
            },
            {
                $Type : 'UI.DataField',
                Value : ruleType.description,
                Label : '{i18n>RuleDescription}',
            },
            {
                $Type : 'UI.DataField',
                Value : objectType,
                Label : 'Object Type',
            },
            {
                $Type : 'UI.DataField',
                Value : value,
                Label : 'Rule Value',
            },
        ],
    },
    UI.HeaderInfo : {
        TypeName : 'Base Rule',
        TypeNamePlural : 'Base Rules',
        Title : {
            $Type : 'UI.DataField',
            Value : ID,
        },
        Description : {
            $Type : 'UI.DataField',
            Value : 'Code-Writing Rule Template',
        },
    },
    UI.HeaderFacets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Admin Info',
            ID : 'AdminInfo',
            Target : '@UI.FieldGroup#AdminInfo',
        },
    ],
    UI.FieldGroup #AdminInfo : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : createdAt,
            },
            {
                $Type : 'UI.DataField',
                Value : modifiedAt,
            },
            {
                $Type : 'UI.DataField',
                Value : Author,
            },
            {
                $Type : 'UI.DataField',
                Value : EditedBy,
            },
        ],
    },
);

