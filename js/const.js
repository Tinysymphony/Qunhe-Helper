var CONST = {
    // Run Mode
    MODE: {
        TEST_MODE: 'test'
    },
    // Actions
    ACTION: {
        READY: 'ready',
        CLOSE_APP: 'close-app',
        NEW_WINDOW: 'start-new',
        DATA_REQUEST: 'ask-for-data',
        LOGIN: 'login',
        LOGIN_TEST: 'test',
        RENDER_DOT: 'render-dot',
        POLLING_MSG: 'polling-msg',
        POLLING_BUG: 'polling-bug',
        RESTART: 'restart'
    },
    // New windows
    WINDOW: {
        TASK: 'task',
        BUG: 'bug',
        MESSAGE: 'message',
        INFO: 'info',
        SETTINGS: 'settings',
        TOP: 'top',
        ABOUT: 'about'
    },
    // Bug Status
    STATUS: {
        OPEN_BUG: 'Open',
        CLOSED_BUG: 'Closed',
        RESOLVED_BUG: 'Resolved',
        REOPENED_BUG: 'Reopened'
    },
    // Detailed Data Type
    TYPE: {
        HISTROY_BUG: 'his-bug',
        RANK_BUG: 'rank-bug',
        BUG: 'bug'
    },
    // Send message to front-end
    SEND: {
        CLOSE: 'close',
        RELOAD: 'reload',
        DATA_PATH: 'data-path',
        LOGIN_SUCCESS: 'login-success',
        LOGIN_FAILED: 'login-error',
        RENDER_MESSAGE: 'render-message',
        RENDER_MESSAGE_ERROR: 'render-message-error',
        RENDER_BUG: 'render-bug',
        RENDER_BUG_ERROR: 'render-bug-error',
        LOAD_INFO: 'load-info',
        LOAD_TASK: 'load-task',
        LOAD_BUG: 'load-bug',
        LOAD_RANK: 'load-rank',
        LOAD_MESSAGE: 'load-message',
        LOAD_SETTINGS: 'load-settings',
        LOAD_FAILED: 'load-fail',
        UPDATE_MENU_BUG: 'update-menu-bug',
        GET_USERS: 'get-users',
        GET_USERS_ERROR: 'get-users-error'
    },
    // Urls
};

// _createConstant(CONST);

module.exports = CONST;
