<#if user.firstName?? && user.lastName??>Hello ${user.firstName}
${user.lastName}<#elseif firstName??>Hello ${user.firstName}<#else>Hello
Guest!</#if><#list requiredActions><#items as reqActionItem>Custom
Tag</#items></#list>;