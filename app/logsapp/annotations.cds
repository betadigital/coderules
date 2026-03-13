using RuleService as service from '../../srv/rule-service';
annotate service.AutomationLogs with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : user_ID,
            Label : '{i18n>Developer}',
        },
        {
            $Type : 'UI.DataField',
            Value : transportRequest,
            Label : '{i18n>TransportRequest}',
        },
        {
            $Type : 'UI.DataField',
            Value : subRequest,
            Label : '{i18n>SubRequest}',
        },
        {
            $Type : 'UI.DataField',
            Value : checkDate,
            Label : '{i18n>CheckDate}',
        },
        {
            $Type : 'UI.DataField',
            Value : baseRule.objectType_code,
            Label : '{i18n>ObjectType}',
        },
        {
            $Type : 'UI.DataField',
            Value : baseRule.ruleType_code,
            Label : '{i18n>RuleType}',
        },
        {
            $Type : 'UI.DataField',
            Value : baseRule.value,
            Label : '{i18n>Value}',
        },
        {
            $Type : 'UI.DataField',
            Value : objectName,
            Label : 'Object Name',
        },
        {
            $Type : 'UI.DataField',
            Value : severity,
            Label : 'Severity',
        },
        {
            $Type : 'UI.DataField',
            Value : result,
            Label : '{i18n>Result}',
        },
    ],
    UI.HeaderFacets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Information',
            ID : 'LogInformation',
            Target : '@UI.FieldGroup#LogInformation',
        },
    ],
    UI.FieldGroup #LogInformation : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : user_ID,
                Label : 'User ',
            },
            {
                $Type : 'UI.DataField',
                Value : transportRequest,
                Label : 'Transport Request',
            },
            {
                $Type : 'UI.DataField',
                Value : subRequest,
                Label : '{i18n>SubRequest}',
            },
            {
                $Type : 'UI.DataField',
                Value : checkDate,
                Label : 'Check Date',
            },
            {
                $Type : 'UI.DataField',
                Value : baseRule.value,
                Label : 'Value',
            },
            {
                $Type : 'UI.DataField',
                Value : baseRule.ruleType_description,
                Label : 'Rule Description',
            },
            {
                $Type : 'UI.DataField',
                Value : baseRule.ruleType_code,
                Label : 'Rule Type',
            },
            {
                $Type : 'UI.DataField',
                Value : baseRule.objectType_code,
                Label : 'Object Type',
            },
        ],
    },
    UI.HeaderInfo : {
        TypeName : 'Code Review Log',
        TypeNamePlural : 'Code Review Logs',
        Description : {
            $Type : 'UI.DataField',
            Value : 'Detailed log information ',
        },
        Title : {
            $Type : 'UI.DataField',
            Value : result,
        },
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Code Review Details',
            ID : 'CodeReviewDetails',
            Target : '@UI.FieldGroup#CodeReviewDetails',
        },
    ],
    UI.FieldGroup #CodeReviewDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : result,
                Label : 'Result',
            },
            {
                $Type : 'UI.DataField',
                Value : codeLine,
                Label : '{i18n>CodeLine}',
            },
            {
                $Type : 'UI.DataField',
                Value : codeQualityRule,
                Label : '{i18n>CodeQualityRule}',
            },
            {
                $Type : 'UI.DataField',
                Value : message,
                Label : '{i18n>Message}',
            },
        ],
    },
    UI.SelectionFields : [
        transportRequest,
        subRequest,
        baseRule.objectType_code,
        baseRule.ruleType_code,
        objectName,
        codeQualityRule,
    ],
);

annotate service.AutomationLogs with {
    transportRequest @Common.Label : '{i18n>TransportReq}'
};

annotate service.AutomationLogs with {
    subRequest @Common.Label : '{i18n>SubRequest}'
};

annotate service.AutomationLogs with {
    objectName @Common.Label : '{i18n>ObjectName}'
};

annotate service.AutomationLogs with {
    codeQualityRule @Common.Label : '{i18n>CodeQualityRule}'
};

annotate service.BaseRules with {
    objectType @Common.Label : '{i18n>ObjectType}'
};

annotate service.BaseRules with {
    ruleType @Common.Label : '{i18n>RuleType}'
};

