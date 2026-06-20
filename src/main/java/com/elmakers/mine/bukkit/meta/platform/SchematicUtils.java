package com.elmakers.mine.bukkit.meta.platform;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.logging.Logger;

import com.elmakers.mine.bukkit.utility.platform.Platform;
import com.elmakers.mine.bukkit.utility.schematic.LoadableSchematic;

public class SchematicUtils implements com.elmakers.mine.bukkit.utility.platform.SchematicUtils{
    private final Platform platform;

    public SchematicUtils(Platform platform) {
        this.platform = platform;
    }

    @Override
    public boolean loadSchematic(InputStream input, LoadableSchematic schematic, Logger log) {
        return false;
    }

    @Override
    public boolean saveSchematic(OutputStream output, String[][][] blockData) {
        return false;
    }

    @Override
    public boolean saveStructure(OutputStream output, String[][][] blockData) {
        return false;
    }

    @Override
    public boolean loadLegacySchematic(InputStream input, LoadableSchematic schematic) {
        return false;
    }
}
