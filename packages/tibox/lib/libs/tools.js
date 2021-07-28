"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildProjectName = exports.buildDestFolderName = void 0;
function buildDestFolderName(project, product, mode) {
    return `dist-${buildProjectName(project, product, mode)}`;
}
exports.buildDestFolderName = buildDestFolderName;
function buildProjectName(project, product, mode) {
    return `${project}-${product}-${mode}`;
}
exports.buildProjectName = buildProjectName;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGlicy90b29scy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxTQUFnQixtQkFBbUIsQ0FDakMsT0FBZSxFQUNmLE9BQWUsRUFDZixJQUFZO0lBRVosT0FBTyxRQUFRLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUM1RCxDQUFDO0FBTkQsa0RBTUM7QUFFRCxTQUFnQixnQkFBZ0IsQ0FDOUIsT0FBZSxFQUNmLE9BQWUsRUFDZixJQUFZO0lBRVosT0FBTyxHQUFHLE9BQU8sSUFBSSxPQUFPLElBQUksSUFBSSxFQUFFLENBQUM7QUFDekMsQ0FBQztBQU5ELDRDQU1DIn0=