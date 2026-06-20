package com.elmakers.mine.bukkit.meta.platform;

import java.net.URL;
import java.util.Collection;
import java.util.UUID;

import org.bukkit.Material;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.ItemStack;

import com.elmakers.mine.bukkit.utility.CurrencyAmount;
import com.elmakers.mine.bukkit.utility.platform.Platform;

public class InventoryUtils implements com.elmakers.mine.bukkit.utility.platform.InventoryUtils {
    private final Platform platform;

    public InventoryUtils(Platform platform) {
        this.platform = platform;
    }

    @Override
    public CurrencyAmount getCurrencyAmount(ItemStack item) {
        return null;
    }

    @Override
    public boolean configureSkillItem(ItemStack skillItem, String skillClass, boolean quickCast, ConfigurationSection skillConfig) {
        return false;
    }

    @Override
    public ItemStack setSkullURL(ItemStack itemStack, String url) {
        return null;
    }

    @Override
    public ItemStack setSkullURL(ItemStack itemStack, URL url, UUID id) {
        return null;
    }

    @Override
    public ItemStack setSkullURL(ItemStack itemStack, URL url, UUID id, String name) {
        return null;
    }

    @Override
    public String getSkullURL(ItemStack skull) {
        return "";
    }

    @Override
    public boolean isSkull(ItemStack item) {
        return false;
    }

    @Override
    public void wrapText(String text, Collection<String> list) {

    }

    @Override
    public void wrapText(String text, String prefix, Collection<String> list) {

    }

    @Override
    public void wrapText(String text, int maxLength, Collection<String> list) {

    }

    @Override
    public void wrapText(String text, String prefix, int maxLength, Collection<String> list) {

    }

    @Override
    public boolean hasItem(Inventory inventory, String itemName) {
        return false;
    }

    @Override
    public ItemStack getItem(Inventory inventory, String itemName) {
        return null;
    }

    @Override
    public void makeKeep(ItemStack itemStack) {

    }

    @Override
    public boolean isKeep(ItemStack itemStack) {
        return false;
    }

    @Override
    public void applyAttributes(ItemStack item, ConfigurationSection attributeConfig, String slot) {

    }

    @Override
    public void applyEnchantments(ItemStack item, ConfigurationSection enchantConfig) {

    }

    @Override
    public boolean addEnchantments(ItemStack item, ConfigurationSection enchantConfig) {
        return false;
    }

    @Override
    public String describeProperty(Object property) {
        return "";
    }

    @Override
    public String describeProperty(Object property, int maxLength) {
        return "";
    }

    @Override
    public boolean isSameInstance(ItemStack one, ItemStack two) {
        return false;
    }

    @Override
    public int getMapId(ItemStack mapItem) {
        return 0;
    }

    @Override
    public void setMapId(ItemStack mapItem, int id) {

    }

    @Override
    public ItemStack createMap(Material material, int id) {
        return null;
    }
}
