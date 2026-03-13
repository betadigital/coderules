using BaseRuleService as service from '../../srv/baserule-service';
annotate service.BaseRules with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : objectType_code,
            Label : '{i18n>ObjectType}',
        },
        {
            $Type : 'UI.DataField',
            Value : ruleType.description,
            Label : '{i18n>RuleDescription}',
        },
        {
            $Type : 'UI.DataField',
            Value : ruleType_code,
            Label : '{i18n>RuleType}',
        },
        {
            $Type : 'UI.DataField',
            Value : value,
            Label : '{i18n>RuleValue}',
        },
        {
            $Type : 'UI.DataField',
            Value : Author,
            Label : '{i18n>Author}',
        },
        {
            $Type : 'UI.DataField',
            Value : createdAt,
        },
        {
            $Type : 'UI.DataField',
            Value : severityRating,
            Label : '{i18n>Severity}',
        },
        {
            $Type : 'UI.DataField',
            Value : codeQualityRule,
            Label : '{i18n>CodeQualityRule}',
        },
        {
            $Type : 'UI.DataField',
            Value : isActive,
            Label : '{i18n>IsActive}',
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
                Value : objectType_code,
                Label : 'Object Type',
            },
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
                Value : value,
                Label : 'Rule Value',
            },
            {
                $Type : 'UI.DataField',
                Value : severityRating,
                Label : 'Severity Rating',
            },
            {
                $Type : 'UI.DataField',
                Value : codeQualityRule,
                Label : 'Code Quality Rule?',
            },
            {
                $Type : 'UI.DataField',
                Value : isActive,
                Label : '{i18n>IsActive}',
            },
        ],
    },
    UI.HeaderInfo : {
        TypeName : 'Code Review Rule',
        TypeNamePlural : 'Code Review Rules',
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
    UI.SelectionFields : [
        objectType_code,
        ruleType_code,
        severityRating,
        isActive,
        codeQualityRule,
    ],
);

annotate service.BaseRules with {
    objectType @Common.Label : '{i18n>ObjectType}'
};

annotate service.BaseRules with {
    ruleType @Common.Label : '{i18n>RuleType}'
};

annotate service.BaseRules with {
    severityRating @Common.Label : '{i18n>Severity1}'
};

annotate service.BaseRules with {
    isActive @Common.Label : '{i18n>IsActive}'
};

annotate service.BaseRules with {
    codeQualityRule @Common.Label : '{i18n>CodeQualityRule}'
};

