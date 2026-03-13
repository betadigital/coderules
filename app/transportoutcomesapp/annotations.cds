using RuleService as service from '../../srv/rule-service';
annotate service.TransportOutcomes with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : ID,
            Label : 'ID',
            @UI.Hidden,
        },
        {
            $Type : 'UI.DataField',
            Value : transportRequest,
            Label : 'Transport Request',
        },
        {
            $Type : 'UI.DataField',
            Value : user_ID,
            Label : '{i18n>Developer1}',
        },
        {
            $Type : 'UI.DataField',
            Value : failedChecks,
            Label : 'Failed Checks?',
        },
        {
            $Type : 'UI.DataField',
            Value : createdAt,
        },
    ],
    UI.HeaderFacets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Result',
            ID : 'Result',
            Target : '@UI.FieldGroup#Result',
        },
    ],
    UI.FieldGroup #Result : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : statusText,
            },
            {
                $Type : 'UI.DataField',
                Value : failedChecks,
                Label : 'Failed Checks?',
            },
            {
                $Type : 'UI.DataField',
                Value : transportRequest,
                Label : 'Transport Request ',
            },
            {
                $Type : 'UI.DataField',
                Value : user_ID,
                Label : 'User ID',
            },
            {
                $Type : 'UI.DataField',
                Value : user.isActive,
                Label : 'User: Is Active?',
            },
        ],
    },
    UI.HeaderInfo : {
        Title : {
            $Type : 'UI.DataField',
            Value : statusText,
        },
        TypeName : '',
        TypeNamePlural : '',
        Description : {
            $Type : 'UI.DataField',
            Value : transportRequest,
        },
    },
    UI.SelectionFields : [
        transportRequest,
        user_ID,
    ],
);

annotate service.TransportOutcomes with {
    transportRequest @Common.Label : '{i18n>TransportReq}'
};

annotate service.TransportOutcomes with {
    user @Common.Label : '{i18n>DeveloperId}'
};

