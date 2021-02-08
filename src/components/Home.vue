<template>
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/header.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logOut">退出</el-button>
    </el-header>
    <el-container>
      <!-- 菜单 -->
      <el-aside :width="iscollapse ? '64px' : '200px'">
        <div class="toggle" @click="toggleClick">|||</div>
        <el-menu
          :default-active="activePath"
          class="el-menu-vertical-demo"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#00A1D6"
          unique-opened
          :collapse="iscollapse"
          :collapse-transition="false"
          router
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menulist"
            :key="item.id"
          >
            <!-- 一级菜单模板 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="icons[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavStateClick('/' + subItem.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      // 图标
      icons: {
        125: "iconfont icon-users",
        103: "iconfont icon-tijikongjian",
        101: "iconfont icon-shangpin",
        102: "iconfont icon-danju",
        145: "iconfont icon-baobiao",
      },
      iscollapse: false,
      activePath: "",
    };
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem("activePath");
  },
  methods: {
    logOut() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    // 获取所有菜单
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message(res.meta.msg);
      this.menulist = res.data;
    },
    // 侧边栏折叠按钮
    toggleClick() {
      this.iscollapse = !this.iscollapse;
    },
    // 保存链接的激活状态
    saveNavStateClick(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
      this.activePath = activePath;
    },
  },
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  padding-left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #373d41;
  > div {
    display: flex;
    align-items: center;
    font-size: 24px;
    color: #fff;
    > img {
      margin-right: 15px;
      width: 65px;
      height: 100%;
      border-radius: 50%;
    }
  }
}

.el-aside {
  background-color: #545c64;
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 8px;
}

.toggle {
  font-size: 12px;
  line-height: 24px;
  text-align: center;
  color: #fff;
  background-color: #4a5064;
  cursor: pointer;
  letter-spacing: 0.2em;
}
</style>