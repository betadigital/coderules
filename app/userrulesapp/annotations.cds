using RuleService as service from '../../srv/rule-service';

annotate service.CodeUsers with @(
    UI.LineItem              : [
        {
            $Type: 'UI.DataField',
            Value: ID,
            Label: '{i18n>DeveloperId}',
        },
        {
            $Type : 'UI.DataField',
            Value : trusted,
            Label : '{i18n>Trusted}',
            Criticality : trust_score,
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
        TypeName       : 'Developer',
        TypeNamePlural : 'Developers',
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
            {
                $Type : 'UI.DataField',
                Value : trusted,
                Label : 'Is Trusted?',
            },
        ],
    },
    UI.SelectionFields : [
        ID,
        trusted,
        isActive,
    ],
);


annotate service.CodeUsers with {
    trusted @Common.Label : '{i18n>Trusted}'
};

annotate service.CodeUsers with {
    isActive @Common.Label : '{i18n>Active}'
};

annotate service.CodeUsers with {
    ID @Common.Label : '{i18n>DeveloperId}'
};

