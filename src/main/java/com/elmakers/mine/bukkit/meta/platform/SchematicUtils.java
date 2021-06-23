package com.elmakers.mine.bukkit.meta.platform;

import java.io.InputStream;
import java.util.logging.Logger;

import com.elmakers.mine.bukkit.utility.platform.Platform;
import com.elmakers.mine.bukkit.utility.platform.base.SchematicUtilsBase;
import com.elmakers.mine.bukkit.utility.schematic.LoadableSchematic;

public class SchematicUtils extends SchematicUtilsBase {
    public SchematicUtils(Platform platform) {
        super(platform);
    }

    @Override
    public boolean loadSchematic(InputStream input, LoadableSchematic schematic, Logger log) {
        return false;
    }

    @Override
    public boolean loadLegacySchematic(InputStream input, LoadableSchematic schematic) {
        return false;
    }
}
