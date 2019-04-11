"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const request = require("request");
// a request wrapper that retains cookies
exports.gigasetRequest = request.defaults({ jar: true });
// gigaset URLs
var GIGASET_URL;
(function (GIGASET_URL) {
    GIGASET_URL["LOGIN"] = "https://im.gigaset-elements.de/identity/api/v1/user/login";
    GIGASET_URL["BASE"] = "https://api.gigaset-elements.de";
    GIGASET_URL["AUTH"] = "https://api.gigaset-elements.de/api/v1/auth/openid/begin?op=gigaset";
    GIGASET_URL["EVENTS"] = "https://api.gigaset-elements.de/api/v2/me/events?from_ts=";
    GIGASET_URL["CAMERA"] = "https://api.gigaset-elements.de/api/v1/me/cameras/{id}/liveview/start";
    GIGASET_URL["SENSORS"] = "https://api.gigaset-elements.de/api/v1/me/basestations";
})(GIGASET_URL = exports.GIGASET_URL || (exports.GIGASET_URL = {}));
/**
 * authorize on gigaset API
 */
function authorize(callback = () => { }) {
    console.info('authorize on gigaset cloud api : starting');
    exports.gigasetRequest.post(GIGASET_URL.LOGIN, { form: { email: utils_1.conf('email'), password: utils_1.conf('password') } }, () => {
        exports.gigasetRequest.get(GIGASET_URL.AUTH, () => {
            console.info('authorize on gigaset cloud api : done');
            callback();
        });
    });
}
exports.authorize = authorize;
/**
 * log and try to recover from an unexpected gigaset response (ie. re-authorize)
 *
 * @remarks the gigaset connection tokens are sometimes reset on gigaset side at unexpectable time
 */
function handleGigasetError(functionName, error, body) {
    console.error(functionName + ' | unexpected error:', error);
    console.error(functionName + ' | gigaset response:' + body);
    authorize();
}
exports.handleGigasetError = handleGigasetError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2lnYXNldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9naWdhc2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQStCO0FBQy9CLG1DQUFtQztBQUVuQyx5Q0FBeUM7QUFDNUIsUUFBQSxjQUFjLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFBO0FBRTNELGVBQWU7QUFDZixJQUFZLFdBT1g7QUFQRCxXQUFZLFdBQVc7SUFDbkIsa0ZBQXFFLENBQUE7SUFDckUsdURBQTJDLENBQUE7SUFDM0MsMkZBQStFLENBQUE7SUFDL0UsbUZBQXFFLENBQUE7SUFDckUsK0ZBQWlGLENBQUE7SUFDakYsaUZBQWtFLENBQUE7QUFDdEUsQ0FBQyxFQVBXLFdBQVcsR0FBWCxtQkFBVyxLQUFYLG1CQUFXLFFBT3RCO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixTQUFTLENBQUMsUUFBUSxHQUFHLEdBQUUsRUFBRSxHQUFDLENBQUM7SUFDMUMsT0FBTyxDQUFDLElBQUksQ0FBQywyQ0FBMkMsQ0FBQyxDQUFBO0lBQ3pELHNCQUFjLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBQyxJQUFJLEVBQUUsRUFBQyxLQUFLLEVBQUUsWUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFFBQVEsRUFBRSxZQUFJLENBQUMsVUFBVSxDQUFDLEVBQUMsRUFBQyxFQUFFLEdBQUcsRUFBRTtRQUN2RyxzQkFBYyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRTtZQUN6QyxPQUFPLENBQUMsSUFBSSxDQUFDLHVDQUF1QyxDQUFDLENBQUE7WUFDckQsUUFBUSxFQUFFLENBQUE7UUFDWCxDQUFDLENBQUMsQ0FBQTtJQUNILENBQUMsQ0FBQyxDQUFBO0FBQ0gsQ0FBQztBQVJELDhCQVFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQWdCLGtCQUFrQixDQUFDLFlBQW9CLEVBQUUsS0FBYSxFQUFFLElBQVk7SUFDbkYsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsc0JBQXNCLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDM0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLENBQUE7SUFDM0QsU0FBUyxFQUFFLENBQUE7QUFDWixDQUFDO0FBSkQsZ0RBSUMifQ==