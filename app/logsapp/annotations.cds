using RuleService as service from '../../srv/rule-service';
annotate service.AutomationLogs with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : user_ID,
            Label : '{i18n>User}',
        },
        {
            $Type : 'UI.DataField',
            Value : transportRequest,
            Label : '{i18n>TransportRequest}',
        },
        {
            $Type : 'UI.DataField',
            Value : checkDate,
            Label : '{i18n>CheckDate}',
        },
        {
            $Type : 'UI.DataField',
            Value : baseRule.objectType,
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
            Label : 'Log Information',
            ID : 'LogInformation',
            Target : '@UI.FieldGroup#LogInformation',
        },
    ],
    UI.FieldGroup #LogInformation : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : ID,
                Label : 'ID',
            },
            {
                $Type : 'UI.DataField',
                Value : transportRequest,
                Label : 'transportRequest',
            },
            {
                $Type : 'UI.DataField',
                Value : result,
                Label : 'result',
            },
            {
                $Type : 'UI.DataField',
                Value : user_ID,
                Label : 'user_ID',
            },
            {
                $Type : 'UI.DataField',
                Value : checkDate,
                Label : 'checkDate',
            },
            {
                $Type : 'UI.DataField',
                Value : baseRule.value,
                Label : 'value',
            },
            {
                $Type : 'UI.DataField',
                Value : baseRule.ruleType_description,
                Label : 'ruleType_description',
            },
            {
                $Type : 'UI.DataField',
                Value : baseRule.ruleType_code,
                Label : 'ruleType_code',
            },
            {
                $Type : 'UI.DataField',
                Value : baseRule.objectType,
                Label : 'objectType',
            },
        ],
    },
    UI.HeaderInfo : {
        TypeName : 'Automation Log',
        TypeNamePlural : 'Automation Logs',
        Description : {
            $Type : 'UI.DataField',
            Value : 'Detailed log information ',
        },
        Title : {
            $Type : 'UI.DataField',
            Value : ID,
        },
    },
);

