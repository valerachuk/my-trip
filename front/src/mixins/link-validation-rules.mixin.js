const { LINK_REGEX } = require('@constants'),
      linkValidMixin = {
        data () {
          return {
            rules: {
              linkValid: v => {
                if (v) {
                  return RegExp(LINK_REGEX).test(v) || this.$t('validationRules.isNoLink');
                } else {
                  return true;
                }
              }
            }
          };
        }
      };

export { linkValidMixin };
