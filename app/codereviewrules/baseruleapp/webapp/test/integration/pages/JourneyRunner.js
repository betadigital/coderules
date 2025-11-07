sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"baseruleapp/test/integration/pages/BaseRulesList",
	"baseruleapp/test/integration/pages/BaseRulesObjectPage"
], function (JourneyRunner, BaseRulesList, BaseRulesObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('baseruleapp') + '/test/flp.html#app-preview',
        pages: {
			onTheBaseRulesList: BaseRulesList,
			onTheBaseRulesObjectPage: BaseRulesObjectPage
        },
        async: true
    });

    return runner;
});

