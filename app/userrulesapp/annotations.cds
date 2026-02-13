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
        {
            $Type : 'UI.DataField',
            Value : isActive,
            Label : '{i18n>IsActive}',
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
    UI.Facets                : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>UserInformation}',
            ID : 'Info',
            Target : '@UI.FieldGroup#Info',
        },
    ],
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
    UI.FieldGroup #Info : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : ID,
            },
            {
                $Type : 'UI.DataField',
                Value : isActive,
                Label : 'Is Active?',
            },
        ],
    },
);


