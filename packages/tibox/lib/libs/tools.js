"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseProjectName = exports.parseDestFolderName = void 0;
function parseDestFolderName(project, product, mode) {
    return `dist-${parseProjectName(project, product, mode)}`;
}
exports.parseDestFolderName = parseDestFolderName;
function parseProjectName(project, product, mode) {
    return `${project}-${product}-${mode}`;
}
exports.parseProjectName = parseProjectName;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGlicy90b29scy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxTQUFnQixtQkFBbUIsQ0FDakMsT0FBZSxFQUNmLE9BQWUsRUFDZixJQUFZO0lBRVosT0FBTyxRQUFRLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUM1RCxDQUFDO0FBTkQsa0RBTUM7QUFFRCxTQUFnQixnQkFBZ0IsQ0FDOUIsT0FBZSxFQUNmLE9BQWUsRUFDZixJQUFZO0lBRVosT0FBTyxHQUFHLE9BQU8sSUFBSSxPQUFPLElBQUksSUFBSSxFQUFFLENBQUM7QUFDekMsQ0FBQztBQU5ELDRDQU1DIn0=