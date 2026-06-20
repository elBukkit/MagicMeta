package com.elmakers.mine.bukkit.meta.platform;

import java.util.UUID;

import org.bukkit.Location;
import org.bukkit.Material;
import org.bukkit.OfflinePlayer;
import org.bukkit.UnsafeValues;
import org.bukkit.block.Biome;
import org.bukkit.block.Block;
import org.bukkit.block.Skull;
import org.bukkit.entity.Entity;
import org.bukkit.entity.EntityType;
import org.bukkit.entity.Player;
import org.bukkit.event.enchantment.PrepareItemEnchantEvent;
import org.bukkit.inventory.ItemStack;
import org.bukkit.map.MapView;
import org.bukkit.plugin.Plugin;

import com.elmakers.mine.bukkit.utility.SkullLoadedCallback;
import com.elmakers.mine.bukkit.utility.platform.Platform;

public class DeprecatedUtils implements com.elmakers.mine.bukkit.utility.platform.DeprecatedUtils {
    private final Platform platform;

    public DeprecatedUtils(Platform platform) {
        this.platform = platform;
    }

    @Override
    public void updateInventory(Player player) {

    }

    @Override
    public void setTypeAndData(Block block, Material material, byte data, boolean applyPhysics) {
        block.setType(material, applyPhysics);
    }

    @Override
    public MapView getMap(int id) {
        return null;
    }

    @Override
    public int getMapId(MapView mapView) {
        return 0;
    }

    @Override
    public String getName(EntityType entityType) {
        return "";
    }

    @Override
    public String getDisplayName(Entity entity) {
        return "";
    }

    @Override
    public OfflinePlayer getOfflinePlayer(String name) {
        return null;
    }

    @Override
    public Player getPlayer(String name) {
        return null;
    }

    @Override
    public Player getPlayerExact(String name) {
        return null;
    }

    @Override
    public void setSkullOwner(ItemStack itemStack, String ownerName, SkullLoadedCallback callback) {

    }

    @Override
    public void setSkullOwner(ItemStack itemStack, UUID ownerUUID, SkullLoadedCallback callback) {

    }

    @Override
    public void setOwner(Skull skull, UUID uuid) {

    }

    @Override
    public void setOwner(Skull skull, String ownerName) {

    }

    @Override
    public void showPlayer(Plugin plugin, Player toPlayer, Player showPlayer) {

    }

    @Override
    public void hidePlayer(Plugin plugin, Player fromPlayer, Player hidePlayer) {

    }

    @Override
    public int[] getExpLevelCostsOffered(PrepareItemEnchantEvent event) {
        return new int[0];
    }

    @Override
    public Entity getPassenger(Entity mount) {
        return null;
    }

    @Override
    public void setPassenger(Entity mount, Entity passenger) {

    }

    @Override
    public UnsafeValues getUnsafe() {
        return null;
    }

    @Override
    public boolean isTransparent(Material material) {
        return false;
    }

    @Override
    public void setItemDamage(ItemStack itemStack, short damage) {

    }

    @Override
    public short getItemDamage(ItemStack itemStack) {
        return 0;
    }

    @Override
    public Biome getBiome(Location location) {
        return null;
    }

    @Override
    public ItemStack createItemStack(Material material, int amount, short legacyData) {
        return null;
    }

    @Override
    public void setSkullType(Skull skullBlock, short skullType) {
    }

    @Override
    public short getSkullType(Skull skullBlock) {
        return 0;
    }
}
