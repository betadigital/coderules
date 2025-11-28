using RuleService as service from '../../srv/rule-service';

annotate service.CodeUsers with @(
    UI.LineItem              : [
        {
            $Type: 'UI.DataField',
            Value: ID,
            Label: 'ID',
        },
        {
            $Type : 'UI.DataField',
            Value : trusted,
            Label : 'Trusted',
        },
        {
            $Type: 'UI.DataField',
            Value: createdBy,
        },
        {
            $Type: 'UI.DataField',
            Value: createdAt,
        },
    ],
    UI.HeaderFacets          : [{
        $Type : 'UI.ReferenceFacet',
        Label : 'Admin Info',
        ID    : 'AdminInfo',
        Target: '@UI.FieldGroup#AdminInfo',
    }, ],
    UI.FieldGroup #AdminInfo : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: createdAt,
            },
            {
                $Type: 'UI.DataField',
                Value: createdBy,
            },
            {
                $Type: 'UI.DataField',
                Value: modifiedAt,
                Label: 'Modified on',
            },
            {
                $Type: 'UI.DataField',
                Value: modifiedBy,
                Label: 'Modified by',
            },
            {
                $Type : 'UI.DataField',
                Value : trusted,
                Label : 'Is Trusted?',
            },
        ],
    },
    UI.FieldGroup #AdminInfo1: {
        $Type: 'UI.FieldGroupType',
        Data : [],
    },
    UI.Facets                : [{
        $Type : 'UI.ReferenceFacet',
        Label : 'Rules',
        ID    : 'Rules',
        Target: 'rules/@UI.LineItem#Rules',
    }, ],
    UI.HeaderInfo            : {
        TypeName      : 'Code User',
        TypeNamePlural: 'Code Users',
        Description   : {
            $Type: 'UI.DataField',
            Value: 'User page for a user with write-access to codebase',
        },
        Title : {
            $Type : 'UI.DataField',
            Value : ID,
        },
    },
    UI.Identification : [
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'RuleService.makeTrusted',
            Label : '{i18n>TrustUser}',
            @UI.Hidden : trusted,
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'RuleService.makeUntrusted',
            Label : '{i18n>RevokeTrust}',
            @UI.Hidden : untrusted,
        },
    ],
    UI.FieldGroup #IsTrusted : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : trusted,
                Label : 'trusted',
            },
        ],
    },
);

annotate service.UserRules with @(
    UI.LineItem #Rules                 : [
        {
            $Type: 'UI.DataField',
            Value: baseRule_ID,
            Label: 'Rule Template ID',
        },
        {
            $Type : 'UI.DataField',
            Value : baseRule.objectType_code,
            Label : 'Object Type',
        },
        {
            $Type : 'UI.DataField',
            Value : baseRule.ruleType.description,
            Label : 'Rule Description',
        },
        {
            $Type : 'UI.DataField',
            Value : baseRule.value,
            Label : 'Rule Value',
        },
        {
            $Type: 'UI.DataField',
            Value: effectiveDate,
            Label: 'Date of effect',
        },
        {
            $Type: 'UI.DataField',
            Value: endDate,
            Label: 'Rule end date',
        },
        {
            $Type : 'UI.DataField',
            Value : baseRule.severityRating,
            Label : '{i18n>SeverityRating}',
        },
    ],
    UI.HeaderFacets                    : [{
        $Type : 'UI.ReferenceFacet',
        Label : 'Admin Info',
        ID    : 'AdminInfo',
        Target: '@UI.FieldGroup#AdminInfo',
    }, ],
    UI.FieldGroup #AdminInfo           : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: ID,
                Label: 'ID',
            },
            {
                $Type: 'UI.DataField',
                Value: createdBy,
            },
            {
                $Type: 'UI.DataField',
                Value: createdAt,
            },
            {
                $Type: 'UI.DataField',
                Value: modifiedAt,
            },
            {
                $Type: 'UI.DataField',
                Value: modifiedBy,
            },
        ],
    },
    UI.Facets                          : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Date Info',
            ID    : 'DateInfo',
            Target: '@UI.FieldGroup#DateInfo',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Base Rule Template Info',
            ID    : 'BaseRuleTemplateInfo',
            Target: '@UI.FieldGroup#BaseRuleTemplateInfo',
        },
    ],
    UI.FieldGroup #DateInfo            : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: effectiveDate,
                Label: 'Date of effect',
            },
            {
                $Type: 'UI.DataField',
                Value: endDate,
                Label: 'Rule finish date',
            },
        ],
    },
    UI.FieldGroup #BaseRuleTemplateInfo: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: baseRule_ID,
                Label: 'Rule Template ID',
            },
            {
                $Type : 'UI.DataField',
                Value : baseRule.ruleType.code,
                Label : 'Rule Code',
            },
            {
                $Type : 'UI.DataField',
                Value : baseRule.ruleType.description,
                Label : 'Rule Description',
            },
            {
                $Type : 'UI.DataField',
                Value : baseRule.value,
                Label : 'Rule Value',
            },
            {
                $Type : 'UI.DataField',
                Value : baseRule.objectType_code,
                Label : '{i18n>ObjectType}',
            },
            {
                $Type : 'UI.DataField',
                Value : createdAt,
            },
            {
                $Type : 'UI.DataField',
                Value : createdBy,
                Label : 'Applied by',
            },
        ],
    },
    UI.HeaderInfo                      : {
        TypeName      : 'User Rule',
        TypeNamePlural: 'User Rules',
        Title         : {
            $Type: 'UI.DataField',
            Value: baseRule.ruleType.description
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: 'Core code rule information',
        },
    },
);
