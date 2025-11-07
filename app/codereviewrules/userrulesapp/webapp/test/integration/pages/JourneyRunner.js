sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"userrulesapp/test/integration/pages/CodeUsersList",
	"userrulesapp/test/integration/pages/CodeUsersObjectPage",
	"userrulesapp/test/integration/pages/UserRulesObjectPage"
], function (JourneyRunner, CodeUsersList, CodeUsersObjectPage, UserRulesObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('userrulesapp') + '/test/flp.html#app-preview',
        pages: {
			onTheCodeUsersList: CodeUsersList,
			onTheCodeUsersObjectPage: CodeUsersObjectPage,
			onTheUserRulesObjectPage: UserRulesObjectPage
        },
        async: true
    });

    return runner;
});

