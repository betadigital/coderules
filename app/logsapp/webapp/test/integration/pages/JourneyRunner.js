sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"logsapp/test/integration/pages/AutomationLogsList",
	"logsapp/test/integration/pages/AutomationLogsObjectPage"
], function (JourneyRunner, AutomationLogsList, AutomationLogsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('logsapp') + '/test/flp.html#app-preview',
        pages: {
			onTheAutomationLogsList: AutomationLogsList,
			onTheAutomationLogsObjectPage: AutomationLogsObjectPage
        },
        async: true
    });

    return runner;
});

